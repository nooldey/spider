FROM luodaoyi/docker-library-nginx-git
MAINTAINER luodaoyi

RUN mkdir html && cd html
RUN sed -i "s|#gzip  on;|gzip  on; etag  off; server_tokens off; gzip_types *;|" /etc/nginx/nginx.conf
