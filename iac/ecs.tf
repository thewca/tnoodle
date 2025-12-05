resource "aws_ecs_cluster" "tnoodle_cluster" {
  name = "tnoodle-cluster"

  tags = {
    (var.type) = var.type_ecs
  }
}

resource "aws_ecs_task_definition" "tnoodle_task_definition" {
  family                   = "tnoodle-task-definition"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = templatefile("./templates/container-definitions/tnoodle.json.tpl", {
    app_image      = aws_ecr_repository.tnoodle.repository_url
    aws_region     = var.aws_region
    app_port       = var.tnoodle_port
    container_name = var.tnoodle_name
    fargate_cpu    = var.fargate_cpu
    fargate_memory = var.fargate_memory
  })
  tags = {
    (var.type) = var.type_ecs
  }
}

resource "aws_ecs_service" "tnoodle_service" {
  name          = "tnoodle-service"
  cluster       = aws_ecs_cluster.tnoodle_cluster.id
  desired_count = 1
  launch_type   = "FARGATE"

  task_definition = aws_ecs_task_definition.tnoodle_task_definition.arn

  network_configuration {
    subnets          = [aws_default_subnet.default_az1.id]
    security_groups  = [aws_security_group.allow_tnoodle_default_port.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tnoodle_tg.arn
    container_name   = var.tnoodle_name
    container_port   = var.tnoodle_port
  }

  tags = {
    (var.type) = var.type_ecs
  }
}
