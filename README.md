# Lookout

A docker image, similar to [watchtower](https://github.com/containrrr/watchtower), 
but uses `docker-compose` commands to rebuild images and recreating. 
It's intended to be used for services that have a build context rather than an image. For images, use [watchtower](https://github.com/containrrr/watchtower) as it is the best really. 

Lookout is intended to be used in non production environments.

## Quick Start

Lookout is intended to be used in a `docker-compose` setup.

1. Add the following service to your existing docker compose file and follow the instructions closely for each item.

    ```yaml
    version: '3.4'
    services:
      lookout:
        image: ralphv/lookout
        container_name: lookout
        restart: unless-stopped
        environment:
          - LOOKOUT_DOCKER_COMPOSE=<full local path to docker compose file>
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
          - ./lookout.config.yaml:/config/config.yaml
          - <full local directory to docker compose location>:<full local directory to docker compose location>
    ```
    
    The `<full local directory to docker compose location>` **has to be the same on your host machine and your docker container.** 
    
    This is because `docker-compose` identifies the files by their path, so when `docker-compose up` command is called, it will
    know to recreate the existing instance rather than try to create a new container. 
    
    Example: suppose your docker-compose file's full path is `/docker/home-lab-setup/docker-compose.yaml`
    Then the `volumes` entry should look like this:
    
    ```yaml
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
          - ./lookout.config.yaml:/config/config.yaml
          - /docker/home-lab-setup:/docker/home-lab-setup
    ```
    
    And you need to reflect the path correctly, including the yaml file, using the environment variable `LOOKOUT_DOCKER_COMPOSE` like this
    
    ```yaml
        environment:
          - LOOKOUT_DOCKER_COMPOSE=/docker/home-lab-setup/docker-compose.yaml
    ```
2. Set up your `lookout.config.yaml` file similar to this:

    ```yaml
        version: '1.0'
        services:
          simple-node-express:
            images:
              - node
    ```
    Basically, you need to specify the list of `services` lookout will monitor, and then
    you will need to specify the list of images that your image depends on.
    
    Unlike [watchtower](https://github.com/containrrr/watchtower), you need to tell the container what images to check and when it detects a new image, `lookout` will
    run the following commands
    - `docker-compose pull $service`
    - `docker-compose build $service`
    - `docker-compose up -d $service`
    
    A future release will allow you to specify custom commands in case the default commands don't work well for your case.

### List of environment variables:

- `LOOKOUT_CONFIG`: The location of the config file, defaults to `/config/config.yaml`
- `LOOKOUT_DOCKER_COMPOSE`: The location of the docker-compose file. This has to match the host path.
- `LOOKOUT_LOG_LEVEL`: Defaults to `info`. Can be set to `debug` for more visibility.
- `LOOKOUT_CRON`: The cron job expression for checking for updates. Defaults to `0 */6 * * *` Q 6 hours.
- `LOOKOUT_SEND_SLACK_MESSAGES`: Whether to send Slack messages. Either `true` or `false`
- `LOOKOUT_SLACK_WEBHOOK`: The webhook for Slack integration.

### Known issues:
* Currently, the code can't pull latest digests for images hosted at GitHub `ghcr.io/XXXX`. This is 
because, GitHub requires a token to use its API, the only method that I know of is to pull the image locally and inspect it.

### Release notes:
* 0.5.2: adding optional override per service for docker compose file and cwd
* 0.5.1: minor log and docs fixes
* 0.5.0: alpha release

