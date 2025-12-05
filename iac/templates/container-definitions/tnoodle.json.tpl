[
    {
        "name": "${container_name}",
        "image": "${app_image}:latest",
        "cpu": ${fargate_cpu},
        "memory": ${fargate_memory},
        "networkMode": "awsvpc",
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/${container_name}",
                "awslogs-region": "${aws_region}",
                "awslogs-stream-prefix": "ecs",
                "awslogs-create-group": "true"
            }
        },
        "portMappings": [
            {
                "containerPort": ${app_port},
                "hostPort": ${app_port}
            }
        ]
    }
]
