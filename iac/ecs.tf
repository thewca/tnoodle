resource "aws_ecs_cluster" "keycloak_cluster" {
  name = "tnoodle-cluster"

  tags = {
    (var.type) = var.type_ecs
  }
}
