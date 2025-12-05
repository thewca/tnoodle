data "aws_ssm_parameter" "wca_zone_id" {
  name = "/route53/wca-zone-id"
}
