module "cdn" {
  source = "cloudposse/cloudfront-s3-cdn/aws"

  # Cloud Posse recommends pinning every module to a specific version
  version = "0.92.0"

  origin_bucket             = aws_s3_bucket.fontend_bucket.id
  s3_access_logging_enabled = false
  logging_enabled           = false
  cached_methods            = ["HEAD", "GET", "OPTIONS"]
  default_ttl               = "86400"
  name                      = "cdn"
  stage                     = terraform.workspace
  namespace                 = var.domain_name
  error_document            = "index.html"
  aliases                   = ["${var.project_name}.${var.domain_name}"]
  dns_alias_enabled         = false
  acm_certificate_arn       = var.certificate_arn
  minimum_protocol_version  = "TLSv1.2_2021"

  custom_error_response = [
    {
      error_caching_min_ttl = 10,
      error_code            = 403
      response_code         = 403
      response_page_path    = "/index.html"
    },
    {
      error_caching_min_ttl = 10,
      error_code            = 404
      response_code         = 404
      response_page_path    = "/index.html"
    }
  ]

  depends_on = [aws_s3_bucket.fontend_bucket]
}
