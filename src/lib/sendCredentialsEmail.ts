import { Resend } from 'resend'

export async function sendCredentialsEmail({
  to,
  loginUrl,
  password,
}: {
  to: string
  loginUrl: string
  password: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
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

            <!-- PWA install guide -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e7e0d8;">
              <tr>
                <td style="padding-top:28px;">
                  <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#a8937f;">Pro tip</p>
                  <p style="margin:0 0 16px;font-size:15px;font-weight:400;color:#3d2e28;">Install the app for the best experience</p>
                  <p style="margin:0 0 20px;font-size:13px;color:#6b5e57;line-height:1.6;">
                    Add LovesKeepsake to your home screen so it opens like a native app &mdash; no browser bar, faster access, and a cleaner look. No app store required.
                  </p>

                  <!-- iPhone -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background:#f5f0eb;border-radius:4px;">
                    <tr>
                      <td style="padding:16px;">
                        <p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:0.05em;color:#3d2e28;">&#63743; iPhone (Safari only)</p>
                        <p style="margin:0 0 6px;font-size:12px;color:#6b5e57;line-height:1.7;">
                          1. Open the link above in <strong>Safari</strong> (not Chrome or Firefox).<br/>
                          2. Tap the <strong>Share</strong> button &mdash; the box with an arrow at the bottom of the screen.<br/>
                          3. Scroll down and tap <strong>&ldquo;Add to Home Screen.&rdquo;</strong><br/>
                          4. Tap <strong>Add</strong> in the top-right corner.
                        </p>
                        <p style="margin:8px 0 0;font-size:11px;color:#a8937f;line-height:1.5;">
                          Always open the app from the home screen icon for the best experience.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Android -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;border-radius:4px;">
                    <tr>
                      <td style="padding:16px;">
                        <p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:0.05em;color:#3d2e28;">&#9654; Android (Chrome)</p>
                        <p style="margin:0 0 6px;font-size:12px;color:#6b5e57;line-height:1.7;">
                          1. Open the link above in <strong>Chrome</strong>.<br/>
                          2. Tap the <strong>three-dot menu</strong> in the top-right corner.<br/>
                          3. Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install app&rdquo;</strong> if shown.<br/>
                          4. Tap <strong>Add</strong> to confirm.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
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
