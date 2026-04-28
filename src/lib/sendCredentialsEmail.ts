'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCredentialsEmail({
  to,
  loginUrl,
  password,
}: {
  to: string
  loginUrl: string
  password: string
}) {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'LovesKeepsake <noreply@loveskeepsake.com>',
    to,
    subject: 'Your LovesKeepsake login details',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:4px;overflow:hidden;">
        <tr>
          <td style="padding:40px 40px 32px;border-bottom:1px solid #e7e0d8;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#a8937f;">LovesKeepsake</p>
            <h1 style="margin:0;font-size:28px;font-weight:400;color:#3d2e28;letter-spacing:0.02em;">Your wedding portal is ready</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#6b5e57;line-height:1.6;">
              Use the details below to sign in and start planning your big day.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:12px 16px;background:#f5f0eb;border-radius:4px 4px 0 0;border-bottom:1px solid #e7e0d8;">
                  <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#a8937f;">Login URL</p>
                  <p style="margin:0;font-family:monospace;font-size:13px;color:#3d2e28;">${loginUrl}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#f5f0eb;border-bottom:1px solid #e7e0d8;">
                  <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#a8937f;">Email</p>
                  <p style="margin:0;font-family:monospace;font-size:13px;color:#3d2e28;">${to}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#f5f0eb;border-radius:0 0 4px 4px;">
                  <p style="margin:0 0 2px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#a8937f;">Password</p>
                  <p style="margin:0;font-family:monospace;font-size:13px;letter-spacing:0.15em;color:#3d2e28;">${password}</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:#3d2e28;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;border-radius:2px;">
                    Sign in now
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#a8937f;line-height:1.6;">
              You can change your password after signing in. If you have any trouble, reply to this email and we&rsquo;ll help you out.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })

  if (error) throw new Error(error.message)
}
