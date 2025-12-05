resource "aws_s3_bucket" "fontend_bucket" {
  bucket = "${var.org_name}-${var.project_name}-frontend"
}
