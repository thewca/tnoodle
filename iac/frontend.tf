module "tnoodle_frontend" {
  source = "./modules/frontend"

  aws_region      = var.aws_region
  project_name    = var.tnoodle_name
  zone_id         = data.aws_ssm_parameter.wca_zone_id.value
  domain_name     = var.domain_name
  org_name        = var.org_name
  certificate_arn = data.aws_acm_certificate.certificate_us_east_1.arn
}
