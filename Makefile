SHELL=/usr/bin/env bash

## Build settings
domain = $(shell basename $(shell pwd)).michaelnordmeyer.com
build_date = "2024-04-24T12:00:00.000Z"

## Deployment settings
ssh_host = michaelnordmeyer.com
ssh_port = 1111
ssh_user = root
ssh_path = "/var/www/${domain}/"

.PHONY: build
build:
	$(info ==> Building ${domain}...)
	@qjs --std dhammapada.js "https://${domain}" ${build_date}
	@./generate-icon.sh

.PHONY: robots
robots:
	$(info ==> Building ${domain} robots.txt...)
	@printf "Sitemap: https://${domain}/sitemap.xml\n\n" > robots.txt
	@cat ../robots.txt >> robots.txt

.PHONY: rsync
rsync:
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
scprobots:
	$(info ==> Scp'ing ${domain} robots.txt to SSH host ${ssh_host}...)
	@scp -P ${ssh_port} robots.txt ${ssh_user}@${ssh_host}:${ssh_path}

.PHONY: compress
compress:
	$(info ==> Compressing ${domain} via SSH...)
	@ssh -p ${ssh_port} ${ssh_user}@${ssh_host} 'for file in $$(find ${ssh_path} -type f -regex ".*\.\(css\|map\|html\|js\|json\|svg\|txt\|xml\|xsl\|xslt\)$$"); do printf . && gzip -kf "$${file}" && brotli -kf -q 4 "$${file}"; done; echo'

.PHONY: compressrobots
compressrobots:
	$(info ==> Compressing ${domain} robots.txt via SSH...)
	@ssh -p ${ssh_port} ${ssh_user}@${ssh_host} 'gzip -kf ${ssh_path}/robots.txt && brotli -kf -q 4 ${ssh_path}/robots.txt'

.PHONY: deploy
deploy: clean build robots rsync compress
	$(info ==> Deployed ${domain} to SSH host ${ssh_host}...)

.PHONY: deployrobots
deployrobots: robots scprobots compressrobots
	$(info ==> Deployed ${domain} robots.txt to SSH host ${ssh_host}...)

.PHONY: clean
clean:
	$(info ==> Cleaning ${domain})
	@rm -rf assets/icons chapter-* index.html introduction.html preface.html robots.txt sitemap.xml
