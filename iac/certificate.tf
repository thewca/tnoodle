data "aws_acm_certificate" "certificate" {
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

data "aws_acm_certificate" "certificate_us_east_1" {
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]

  provider = aws.us_east_1
}

