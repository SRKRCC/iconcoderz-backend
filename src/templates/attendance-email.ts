export interface AttendanceEmailData {
  fullName: string;
  email: string;
}

const EVENT_DATE = 'January 24-25, 2026';
const EVENT_TIME = '9:00 AM onwards';
const EVENT_VENUE = 'SRKR Engineering College';

export const generateAttendanceEmailHTML = (user: AttendanceEmailData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to IconCoderz 2K26</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <img src="https://srkrcodingclub.in/logonobg.png" alt="SRKR Coding Club" style="width: 80px; height: auto;" />
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
        🎉 Welcome to IconCoderz 2K26! 🎉
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333333; margin-top: 0; font-size: 24px;">
        Hi ${user.fullName}! 👋
      </h2>
      
      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
        <strong>Thanks for attending IconCoderz 2K26!</strong> 🎊
      </p>

      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
        We're excited to have you here for this competitive coding event. Get ready to challenge yourself, learn new skills, and connect with fellow coders!
      </p>

      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="color: #333333; margin: 0; font-size: 16px; line-height: 1.6;">
          <strong>Event Details:</strong><br>
          📅 Date: ${EVENT_DATE}<br>
          📍 Venue: ${EVENT_VENUE}<br>
          ⏰ Time: ${EVENT_TIME}
        </p>
      </div>

      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
        <strong>What to expect:</strong>
      </p>
      <ul style="color: #555555; font-size: 16px; line-height: 1.8; margin: 10px 0 20px 20px;">
        <li>🏆 Competitive coding challenges</li>
        <li>💡 Problem-solving workshops</li>
        <li>🎁 Amazing prizes and goodies</li>
        <li>🤝 Networking opportunities</li>
        <li>🍕 Refreshments and lunch</li>
      </ul>

      <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 20px 0;">
        Make sure to bring your laptop, charger, and enthusiasm! If you have any questions, feel free to reach out to our team.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #667eea; font-size: 20px; font-weight: 600; margin: 10px 0;">
          Good luck and happy coding! 💻✨
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #666666; font-size: 14px; margin: 5px 0;">
        <strong>IconCoderz 2K26</strong>
      </p>
      <p style="color: #888888; font-size: 13px; margin: 5px 0;">
        Organized by SRKR Coding Club
      </p>
      <p style="color: #888888; font-size: 13px; margin: 15px 0 5px 0;">
        Follow us on social media for updates and announcements
      </p>
      <div style="margin: 15px 0;">
        <a href="https://instagram.com/srkrcodingclub" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Instagram</a>
        <span style="color: #cccccc;">|</span>
        <a href="https://linkedin.com/company/srkr-coding-club" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">LinkedIn</a>
        <span style="color: #cccccc;">|</span>
        <a href="https://srkrcodingclub.in" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Website</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export type { AttendanceEmailData as UserData };
