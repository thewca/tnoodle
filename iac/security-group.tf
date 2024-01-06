resource "aws_security_group" "http_security_group" {
  name        = "http-security-group-tnoodle"
  description = "Allow HTTP"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = var.http_port
    to_port     = var.http_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = var.https_port
    to_port     = var.https_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    (var.type) = var.type_sg
  }
}

resource "aws_security_group" "allow_tnoodle_default_port" {
  name        = "tnoodle-default-port"
  description = "Allow connection to tnoodle default port"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "tnoodle"
    from_port   = var.tnoodle_port
    to_port     = var.tnoodle_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    (var.type) = var.type_sg
  }
}
