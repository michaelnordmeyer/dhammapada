SHELL=/usr/bin/env bash

## Build settings
domain = $(shell basename $(shell pwd)).michaelnordmeyer.com
build_date = "2024-04-24T12:00:00.000Z"

## Deployment settings
ssh_host = michaelnordmeyer.com
ssh_port = 1111
ssh_user = root
ssh_path = "/var/www/${domain}/"

.PHONY: help
help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-14s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build: ## Builds the artifact
	$(info ==> Building ${domain}...)
	@qjs --std dhammapada.js "https://${domain}" ${build_date}
	@./generate-icon.sh

.PHONY: robots
robots: ## Builds robots.txt
	$(info ==> Building ${domain} robots.txt...)
	@printf "Sitemap: https://${domain}/sitemap.xml\n\n" > robots.txt
	@cat ../robots.txt >> robots.txt

.PHONY: rsync
rsync: ## Syncs artifact to remote server
	$(info ==> Rsyncing ${domain}'s content to SSH host ${ssh_host}...)
	@rsync -e "ssh -p ${ssh_port}" -vcrlptDShP --delete --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
		--exclude=.DS_Store \
		--exclude=._* \
		--exclude=.git \
		--exclude=.gitignore \
		--exclude=Makefile \
		--exclude=generate-icon.sh \
		./ \
		${ssh_user}@${ssh_host}:${ssh_path}

.PHONY: scprobots
scprobots: ## Copies robots.txt to remote server
	$(info ==> Scp'ing ${domain} robots.txt to SSH host ${ssh_host}...)
	@scp -P ${ssh_port} robots.txt ${ssh_user}@${ssh_host}:${ssh_path}

.PHONY: compress
compress: ## Compresses select artifacts on the remote server
	$(info ==> Compressing ${domain} via SSH...)
	@ssh -p ${ssh_port} ${ssh_user}@${ssh_host} 'for file in $$(find ${ssh_path} -type f -regex ".*\.\(css\|map\|html\|js\|json\|svg\|txt\|xml\)$$"); do printf . && gzip -kf -9 "$${file}" && brotli -kf -q 9 "$${file}"; done; echo'

.PHONY: compressrobots
compressrobots: ## Compresses robots.txt on the remote server
	$(info ==> Compressing ${domain} robots.txt via SSH...)
	@ssh -p ${ssh_port} ${ssh_user}@${ssh_host} 'gzip -kf -9 ${ssh_path}/robots.txt && brotli -kf -q 9 ${ssh_path}/robots.txt'

.PHONY: deploy
deploy: clean build robots rsync compress ## Builds and deploys artifact to the remote server
	$(info ==> Deployed ${domain} to SSH host ${ssh_host}...)

.PHONY: deployrobots
deployrobots: robots scprobots compressrobots ## Builds and deploys robots.txt to the remote server
	$(info ==> Deployed ${domain} robots.txt to SSH host ${ssh_host}...)

.PHONY: clean
clean: ## Cleans the artifact
	$(info ==> Cleaning ${domain})
	@rm -rf assets/icons chapter-* index.html introduction.html preface.html robots.txt sitemap.xml
