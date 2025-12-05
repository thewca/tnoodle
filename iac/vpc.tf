resource "aws_default_vpc" "default" {
  lifecycle {
    ignore_changes = [tags]
  }
}
