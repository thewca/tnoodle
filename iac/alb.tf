resource "aws_alb" "tnoodle_load_balancer" {
  name            = "tnoodle-alb"
  security_groups = [aws_security_group.http_security_group.id]
  subnets         = [aws_default_subnet.default_az1.id, aws_default_subnet.default_az2.id]
  idle_timeout    = 300

  tags = {
    (var.type) = var.type_alb
  }
}

resource "aws_alb_listener" "api_lb_listener" {
  load_balancer_arn = aws_alb.tnoodle_load_balancer.arn
  port              = var.https_port
  protocol          = "HTTPS"
  certificate_arn   = data.aws_acm_certificate.certificate.arn
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"

  default_action {
    target_group_arn = aws_lb_target_group.tnoodle_tg.arn
    type             = "forward"
  }
}

resource "aws_lb_target_group" "tnoodle_tg" {
  name_prefix = "kctg1"
  port        = var.tnoodle_port
  protocol    = "HTTP"
  vpc_id      = aws_default_vpc.default.id
  target_type = "ip"

  lifecycle {
    create_before_destroy = true
  }

  health_check {
    healthy_threshold   = "3"
    interval            = "60"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/"
    unhealthy_threshold = "2"
  }

  tags = {
    (var.type) = var.type_tg
  }
  depends_on = [aws_alb.tnoodle_load_balancer]
}
