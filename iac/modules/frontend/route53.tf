resource "aws_route53_record" "project_record" {
  zone_id = var.zone_id
  name    = var.project_name
  type    = "A"

  alias {
    name                   = module.cdn.cf_domain_name
    evaluate_target_health = true
    zone_id                = module.cdn.cf_hosted_zone_id
  }
}
