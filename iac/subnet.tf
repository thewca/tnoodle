resource "aws_default_subnet" "default_az1" {
  availability_zone = "us-west-2a"

  tags = {
    (var.type) = var.type_subnet
  }
}

resource "aws_default_subnet" "default_az2" {
  availability_zone = "us-west-2b"

  tags = {
    (var.type) = var.type_subnet
  }
}
