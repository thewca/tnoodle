variable "aws_region" {
  description = "AWS Region"
}

variable "project_name" {
  description = "The name of this project"
}

variable "zone_id" {
  description = "The Route53 zone ID"
}

variable "domain_name" {
  description = "The domain name, web URL"
}

variable "org_name" {
  description = "The name of the organization"
}

variable "certificate_arn" {
  description = "The ARN of the ACM certificate"
}
