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

.PHONY: rsync
rsync:
	$(info ==> Rsyncing ${domain}'s content to SSH host ${ssh_host}...)
	@rsync -e "ssh -p ${ssh_port}" -vcrlptDShP --delete --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
		--exclude=.DS_Store \
		--exclude=._* \
		--exclude=.git \
		--exclude=.gitignore \
		--exclude=Makefile \
		--exclude=icon.sh \
		./ \
		${ssh_user}@${ssh_host}:${ssh_path}

.PHONY: deploy
deploy: clean build rsync
	$(info ==> Deployed ${base_url} to SSH host ${ssh_host}...)

.PHONY: clean
clean:
	$(info ==> Cleaning ${domain})
	@rm -rf assets/icons chapter-* index.html introduction.html preface.html robots.txt sitemap.xml
