interface UserData {
  fullName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  registrationCode: string;
  branch: string;
  yearOfStudy: string;
  codechefHandle?: string | null;
  leetcodeHandle?: string | null;
  codeforcesHandle?: string | null;
}

const EVENT_WHATSAPP_GROUP = 'https://chat.whatsapp.com/DD6dVojz3DJ3TrkNWuIHZX';
const EVENT_DATE = '23rd February 2026';
const EVENT_TIME = '1:30 PM IST';

export const generateRegistrationEmailHTML = (user: UserData): string => {
  const yearMap: Record<string, string> = {
    FIRST_YEAR: '1st Year',
    SECOND_YEAR: '2nd Year',
    THIRD_YEAR: '3rd Year',
  };

  const cpHandles = [
    user.codechefHandle && `<li><strong>CodeChef:</strong> ${user.codechefHandle}</li>`,
    user.leetcodeHandle && `<li><strong>LeetCode:</strong> ${user.leetcodeHandle}</li>`,
    user.codeforcesHandle && `<li><strong>Codeforces:</strong> ${user.codeforcesHandle}</li>`,
  ].filter(Boolean).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IconCoderz 2K26 - Registration Successful</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; border-radius: 10px 10px 0 0; margin-bottom: 0;">
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="https://srkrcodingclub.in/logonobg.png" alt="SRKR Coding Club" style="width: 80px; height: auto;" />
        </div>
        <h1 style="color: white; margin: 0; text-align: center; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">🎉 Registration Successful!</h1>
        <p style="color: #f0f0f0; text-align: center; margin: 10px 0 0 0; font-size: 16px;">Welcome to IconCoderz 2K26</p>
        <p style="color: #ffffff; text-align: center; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Decode • Compete • Dominate</p>
      </div>

      <!-- Registration Code Highlight -->
      <div style="background: #ffffff; padding: 20px; text-align: center; border-left: 5px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Registration Code</p>
        <h2 style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 2px;">${user.registrationCode}</h2>
        <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Keep this code safe - you'll need it for the event!</p>
      </div>

      <!-- Participant Details -->
      <div style="background: #ffffff; padding: 25px; margin-top: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0; color: #495057; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Participant Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Name:</td>
            <td style="padding: 10px 0; color: #333;">${user.fullName}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 8px; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 10px 8px; color: #333;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Phone:</td>
            <td style="padding: 10px 0; color: #333;">${user.phone}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 8px; font-weight: bold; color: #555;">Reg. Number:</td>
            <td style="padding: 10px 8px; color: #333;">${user.registrationNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Branch:</td>
            <td style="padding: 10px 0; color: #333;">${user.branch}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 8px; font-weight: bold; color: #555;">Year:</td>
            <td style="padding: 10px 8px; color: #333;">${yearMap[user.yearOfStudy] || user.yearOfStudy}</td>
          </tr>
        </table>
        
        ${cpHandles ? `
        <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 16px;">CP Handles</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            ${cpHandles}
          </ul>
        </div>
        ` : ''}
      </div>

      <!-- Event Details -->
      <div style="background: #ffffff; padding: 25px; margin-top: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0; color: #495057; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Event Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Date:</td>
            <td style="padding: 10px 0; color: #333;">${EVENT_DATE} (Monday)</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 8px; font-weight: bold; color: #555;">Time:</td>
            <td style="padding: 10px 8px; color: #333;">${EVENT_TIME}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #555;">Mode:</td>
            <td style="padding: 10px 0; color: #333;">Online</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 8px; font-weight: bold; color: #555;">Venue:</td>
            <td style="padding: 10px 8px; color: #333;">SRKR Engineering College, Bhimavaram</td>
          </tr>
        </table>
      </div>

      <!-- QR Code Section -->
      <div style="background: #ffffff; padding: 25px; margin-top: 2px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">Your Entry QR Code</h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; display: inline-block;">
          <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; border: 3px solid #667eea; border-radius: 8px;" />
        </div>
        <p style="margin: 15px 0 0 0; color: #666; font-size: 13px;">Present this QR code at the event entrance</p>
      </div>

      <!-- Next Steps -->
      <div style="background: #e7f3ff; padding: 25px; margin-top: 2px; border-radius: 0 0 10px 10px; border-left: 5px solid #0066cc; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #0066cc; font-size: 18px;">Next Steps</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
          <li style="margin-bottom: 10px;">✅ <strong>Save this email</strong> - You'll need your registration code and QR code</li>
          <li style="margin-bottom: 10px;">💬 <strong>Join WhatsApp Group:</strong> <a href="${EVENT_WHATSAPP_GROUP}" style="color: #667eea; text-decoration: none;">Click here to join</a></li>
          <li style="margin-bottom: 10px;">🌐 <strong>Visit our website:</strong> <a href="https://srkrcodingclub.in" style="color: #667eea; text-decoration: none;">srkrcodingclub.in</a></li>
          <li style="margin-bottom: 10px;">📚 <strong>Prepare well</strong> - Review your DSA concepts and problem-solving skills</li>
        </ul>

        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">⚠️ Payment Status: PENDING</p>
          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
            Your payment is under verification. You'll receive an update within 24-48 hours. 
            If you face any issues, contact us at <a href="tel:8500216667" style="color: #667eea;">8500216667</a> or 
            <a href="mailto:srkrcodingclub@gmail.com" style="color: #667eea;">srkrcodingclub@gmail.com</a>
          </p>
        </div>

        <div style="background: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 15px; margin-top: 15px;">
          <p style="margin: 0; color: #155724; font-size: 14px; line-height: 1.5;">
            <strong>📧 Already paid?</strong> Forward your payment receipt to 
            <a href="mailto:srkrcodingclub@gmail.com" style="color: #667eea;">srkrcodingclub@gmail.com</a> 
            with your registration code <strong>${user.registrationCode}</strong> for faster verification.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
          <strong>Need help?</strong> We're here for you!
        </p>
        <p style="color: #6c757d; margin: 0; font-size: 14px;">
          📧 <a href="mailto:srkrcodingclub@gmail.com" style="color: #667eea; text-decoration: none;">srkrcodingclub@gmail.com</a> | 
          📞 <a href="tel:8500216667" style="color: #667eea; text-decoration: none;">8500216667</a>
        </p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            IconCoderz 2K26 - Organized by SRKR Coding Club
          </p>
          <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">
            SRKR Engineering College, Bhimavaram
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; padding: 10px;">
        <p style="color: #999; font-size: 11px; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;
};

export type { UserData };
