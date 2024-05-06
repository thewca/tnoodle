output "tnoodle_deployment_bucket" {
  value = module.tnoodle_frontend.deployment_bucket
}

output "tnoodle_distribution_id" {
  value = module.tnoodle_frontend.cf_distribution_id
}
