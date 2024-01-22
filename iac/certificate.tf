data "aws_acm_certificate" "certificate" {
  domain   = "*.worldcubeassociation.org"
  statuses = ["ISSUED"]
}
