variable "cloudflare_api_token" {
  type = string
  sensitive = true
}
variable "cloudflare_account_id" {
  type = string
  sensitive = true
}
variable "cloudflare_zone_id" {
  type = string
  sensitive = true
}
variable "cloudflare_domain" {
  type = string
}
variable "github_oauth_client_id" {
  type = "string"
}
variable "github_oauth_client_secret" {
  type = "string"
}
