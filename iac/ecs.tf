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

  container_definitions = templatefile("./templates/container-definitions/tnoodle.json", {
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
