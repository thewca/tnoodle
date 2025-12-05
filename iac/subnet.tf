resource "aws_default_subnet" "default_az1" {
  availability_zone = "us-west-2a"

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_default_subnet" "default_az2" {
  availability_zone = "us-west-2b"

  lifecycle {
    ignore_changes = [tags]
  }
}
