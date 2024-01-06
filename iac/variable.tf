variable "type" {
  default = "Type"
}

variable "type_ecs" {
  default = "ECS"
}

variable "aws_region" {
  default = "us-west-2"
}

variable "tnoodle_name" {
  default = "tnoodle"
}

variable "type_ecr" {
  default = "ECR"
}

variable "tnoodle_port" {
  default = "2014"
}

variable "fargate_cpu" {
  default = "1024" # 1 vCPU
}

variable "fargate_memory" {
  default = "2048" # 2 GB
}
