output "deployment_bucket" {
  value = aws_s3_bucket.fontend_bucket.bucket
}

output "cf_distribution_id" {
  value = module.cdn.cf_id
}

output "cf_domain_name" {
  value = module.cdn.cf_domain_name
}

