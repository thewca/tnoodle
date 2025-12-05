# tnoodle-api.worldcubeassociation.org
resource "aws_route53_record" "project_record" {
  zone_id = data.aws_ssm_parameter.wca_zone_id.value
  name    = "${var.tnoodle_name}-api"
  type    = "A"

  alias {
    name                   = "dualstack.${aws_alb.tnoodle_load_balancer.dns_name}"
    evaluate_target_health = true
    zone_id                = aws_alb.tnoodle_load_balancer.zone_id
  }
}

# scramble-api.worldcubeassociation.org
resource "aws_route53_record" "alternative_record" {
  zone_id = data.aws_ssm_parameter.wca_zone_id.value
  name    = "scramble-api"
  type    = "A"

  alias {
    name                   = "dualstack.${aws_alb.tnoodle_load_balancer.dns_name}"
    evaluate_target_health = true
    zone_id                = aws_alb.tnoodle_load_balancer.zone_id
  }
}
