resource "aws_ecr_repository" "tnoodle" {
  name = "tnoodle"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    (var.type) = var.type_ecr
  }
}

resource "aws_ecr_lifecycle_policy" "expire_policy" {
  repository = aws_ecr_repository.tnoodle.name

  policy = templatefile("./templates/ecr/expire-policy.json", {})
}
