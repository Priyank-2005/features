/**
 * Default Email Templates for Knowith Capital
 * 10 professionally designed, email-client-compatible HTML templates
 */

export interface DefaultTemplate {
  name: string;
  description: string;
  category: string;
  subject: string;
  htmlContent: string;
}

const baseStyle = `
  body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  .email-wrapper { width: 100%; background-color: #f4f4f7; padding: 40px 0; }
  .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 32px 40px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; }
  .header .subtitle { color: #c5a55a; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
  .content { padding: 40px; color: #374151; font-size: 15px; line-height: 1.7; }
  .content h2 { color: #1e3a5f; font-size: 20px; margin-top: 0; }
  .content p { margin: 0 0 16px; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
  .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
  .footer { background: #1e3a5f; padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.6; }
  .footer a { color: #c5a55a; text-decoration: none; }
  .metric-box { display: inline-block; text-align: center; padding: 16px 24px; background: #f9fafb; border-radius: 8px; margin: 8px; min-width: 120px; }
  .metric-value { font-size: 28px; font-weight: 700; color: #1e3a5f; }
  .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
`;

const footer = `
  <div style="background: #1e3a5f; padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.6;">
    <p style="margin: 0 0 8px;">Knowith Capital | Premium Wealth Intelligence</p>
    <p style="margin: 0 0 8px;">{{companyAddress}}</p>
    <p style="margin: 0;">
      <a href="{{unsubscribe}}" style="color: #c5a55a; text-decoration: none;">Unsubscribe</a> &nbsp;|&nbsp;
      <a href="{{viewInBrowser}}" style="color: #c5a55a; text-decoration: none;">View in Browser</a> &nbsp;|&nbsp;
      <a href="mailto:{{supportEmail}}" style="color: #c5a55a; text-decoration: none;">Contact Support</a>
    </p>
    <p style="margin: 8px 0 0; color: #6b7280;">© {{currentYear}} Knowith Capital. All rights reserved.</p>
  </div>
`;

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
<body>
<div style="width: 100%; background-color: #f4f4f7; padding: 40px 0;">
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
${content}
${footer}
</div>
</div>
</body>
</html>`;
}

export const defaultTemplates: DefaultTemplate[] = [
  {
    name: 'Welcome Email',
    description: 'Welcome new clients to Knowith Capital',
    category: 'Welcome',
    subject: 'Welcome to Knowith Capital, {{firstName}}!',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 48px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Welcome to Knowith Capital</h1>
        <p style="color: #c5a55a; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-top: 12px;">Premium Wealth Intelligence</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <h2 style="color: #1e3a5f; font-size: 22px; margin-top: 0;">Hello {{firstName}},</h2>
        <p>Welcome to Knowith Capital. We're delighted to have you join our community of informed investors.</p>
        <p>Your journey toward smarter financial decisions starts here. Our AI-powered platform provides:</p>
        <ul style="padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Personalized investment analysis</li>
          <li style="margin-bottom: 8px;">AI-driven portfolio optimization</li>
          <li style="margin-bottom: 8px;">Tax planning strategies</li>
          <li style="margin-bottom: 8px;">Daily market intelligence</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 15px;">Get Started</a>
        </div>
        <p>If you have questions, our team is always here to help.</p>
        <p style="margin-top: 24px;">Warm regards,<br><strong>The Knowith Capital Team</strong></p>
      </div>
    `),
  },
  {
    name: 'Newsletter',
    description: 'Monthly newsletter with insights and updates',
    category: 'Newsletter',
    subject: 'Knowith Capital Insights — {{currentDate}}',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Monthly Intelligence Brief</h1>
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px;">{{currentDate}}</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Dear {{firstName}},</h2>
        <p>Here's your curated monthly digest of market insights and strategic updates from Knowith Capital.</p>
        <div style="height: 1px; background: #e5e7eb; margin: 24px 0;"></div>
        <h3 style="color: #1e3a5f;">📊 Market Highlights</h3>
        <p>Key market movements and what they mean for your portfolio positioning.</p>
        <div style="height: 1px; background: #e5e7eb; margin: 24px 0;"></div>
        <h3 style="color: #1e3a5f;">💡 Featured Insight</h3>
        <p>This month's deep-dive analysis from our research desk.</p>
        <div style="height: 1px; background: #e5e7eb; margin: 24px 0;"></div>
        <h3 style="color: #1e3a5f;">📈 What's Ahead</h3>
        <p>Key events and dates to watch in the coming weeks.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">Read Full Report</a>
        </div>
      </div>
    `),
  },
  {
    name: 'Investment Update',
    description: 'Periodic investment performance and strategy updates',
    category: 'Investment',
    subject: 'Your Investment Update — {{campaignName}}',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Investment Update</h1>
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px;">Knowith Capital</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Hello {{firstName}},</h2>
        <p>Here's a summary of the latest investment landscape and strategic recommendations.</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; text-align: center; padding: 16px 24px; background: #f0fdf4; border-radius: 8px; margin: 8px;">
            <div style="font-size: 28px; font-weight: 700; color: #16a34a;">+12.4%</div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Portfolio Return</div>
          </div>
          <div style="display: inline-block; text-align: center; padding: 16px 24px; background: #f9fafb; border-radius: 8px; margin: 8px;">
            <div style="font-size: 28px; font-weight: 700; color: #1e3a5f;">85</div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Health Score</div>
          </div>
        </div>
        <p>Our analysts continue to monitor macro-economic indicators and adjust strategic positioning accordingly.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">View Full Analysis</a>
        </div>
      </div>
    `),
  },
  {
    name: 'Market Intelligence',
    description: 'Daily or weekly market intelligence briefing',
    category: 'Market',
    subject: 'Market Intelligence Brief — {{currentDate}}',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🏛️ Market Intelligence</h1>
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px;">{{currentDate}}</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <p>Dear {{firstName}},</p>
        <p>Today's key market developments and their strategic implications:</p>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #c5a55a; margin: 20px 0;">
          <strong style="color: #1e3a5f;">Top Story</strong>
          <p style="margin: 8px 0 0;">Markets respond to central bank signals — what it means for your positioning.</p>
        </div>
        <p>Our sector analysis indicates shifting opportunities across technology, healthcare, and infrastructure.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">Full Market Report</a>
        </div>
      </div>
    `),
  },
  {
    name: 'Portfolio Review',
    description: 'Periodic portfolio review notification',
    category: 'Portfolio',
    subject: 'Your Portfolio Review is Ready, {{firstName}}',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Portfolio Review</h1>
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 2px; margin-top: 8px;">QUARTERLY ASSESSMENT</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Hello {{firstName}},</h2>
        <p>Your quarterly portfolio review has been prepared. Here's a quick snapshot:</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; text-align: center; padding: 16px 24px; background: #f9fafb; border-radius: 8px; margin: 8px;">
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Diversification</div>
            <div style="font-size: 28px; font-weight: 700; color: #1e3a5f;">Good</div>
          </div>
          <div style="display: inline-block; text-align: center; padding: 16px 24px; background: #f9fafb; border-radius: 8px; margin: 8px;">
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Risk Level</div>
            <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">Moderate</div>
          </div>
        </div>
        <p>We have identified 3 actionable recommendations to optimize your portfolio allocation.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">View Full Review</a>
        </div>
      </div>
    `),
  },
  {
    name: 'Tax Planning Reminder',
    description: 'Tax planning season reminder with key dates',
    category: 'Tax',
    subject: 'Tax Planning Reminder — Action Required',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🏦 Tax Planning Reminder</h1>
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 2px; margin-top: 8px;">ACT BEFORE THE DEADLINE</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Dear {{firstName}},</h2>
        <p>The tax planning season is upon us. Here are the key things you should review:</p>
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 12px;"><strong>80C Investments:</strong> Review your ELSS, PPF, and EPF contributions</li>
          <li style="margin-bottom: 12px;"><strong>Health Insurance:</strong> Ensure 80D deductions are maximized</li>
          <li style="margin-bottom: 12px;"><strong>NPS Contributions:</strong> Additional ₹50,000 deduction under 80CCD(1B)</li>
          <li style="margin-bottom: 12px;"><strong>Regime Selection:</strong> Compare Old vs New regime for optimal savings</li>
        </ul>
        <div style="background: #fef3c7; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <strong style="color: #92400e;">⏰ Important:</strong>
          <p style="margin: 4px 0 0; color: #92400e;">Tax-saving investments must be completed before March 31st.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">Start Tax Planning</a>
        </div>
      </div>
    `),
  },
  {
    name: 'Event Invitation',
    description: 'Invitation to exclusive events and seminars',
    category: 'Event',
    subject: "You're Invited — Exclusive Event by Knowith Capital",
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 48px 40px; text-align: center;">
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px;">You're Invited</p>
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Exclusive Investor Event</h1>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <p>Dear {{firstName}},</p>
        <p>We're pleased to invite you to an exclusive event hosted by Knowith Capital.</p>
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Event Details</p>
          <p style="margin: 12px 0 4px; font-size: 18px; font-weight: 600; color: #1e3a5f;">Wealth Building Strategies for 2026</p>
          <p style="margin: 4px 0; color: #4b5563;">📅 Date & Time TBD</p>
          <p style="margin: 4px 0; color: #4b5563;">📍 Virtual / In-Person</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">RSVP Now</a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 13px;">Seats are limited. Register early to secure your spot.</p>
      </div>
    `),
  },
  {
    name: 'Webinar',
    description: 'Webinar registration invitation',
    category: 'Webinar',
    subject: 'Free Webinar: Smart Investing in {{currentYear}}',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 40px; text-align: center;">
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Free Webinar</p>
        <h1 style="color: #ffffff; font-size: 26px; margin: 0;">Smart Investing in {{currentYear}}</h1>
        <p style="color: #d1d5db; margin-top: 12px; font-size: 14px;">Learn strategies from our expert analysts</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <p>Hello {{firstName}},</p>
        <p>Join our upcoming webinar where our senior analysts share actionable insights on building wealth intelligently.</p>
        <h3 style="color: #1e3a5f;">What You'll Learn:</h3>
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 8px;">Market outlook and sector opportunities</li>
          <li style="margin-bottom: 8px;">Portfolio construction best practices</li>
          <li style="margin-bottom: 8px;">Risk management in volatile markets</li>
          <li style="margin-bottom: 8px;">Live Q&A with our research team</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">Register Free</a>
        </div>
      </div>
    `),
  },
  {
    name: 'Festival Greeting',
    description: 'Festival and holiday greetings to clients',
    category: 'Greeting',
    subject: 'Season\'s Greetings from Knowith Capital 🎉',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 48px 40px; text-align: center;">
        <p style="font-size: 48px; margin: 0;">🎉</p>
        <h1 style="color: #ffffff; font-size: 28px; margin: 12px 0 0;">Season's Greetings</h1>
        <p style="color: #c5a55a; font-size: 14px; margin-top: 8px;">From all of us at Knowith Capital</p>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7; text-align: center;">
        <h2 style="color: #1e3a5f; margin-top: 0;">Dear {{firstName}},</h2>
        <p>Wishing you and your family a joyous and prosperous season.</p>
        <p>Thank you for your continued trust in Knowith Capital. We look forward to helping you achieve your financial goals in the year ahead.</p>
        <div style="height: 1px; background: #e5e7eb; margin: 32px 0;"></div>
        <p style="color: #6b7280; font-size: 14px;">Here's to a prosperous {{currentYear}}!</p>
        <p style="margin-top: 24px;"><strong>The Knowith Capital Team</strong></p>
      </div>
    `),
  },
  {
    name: 'Product Launch',
    description: 'New product or feature announcement',
    category: 'Product',
    subject: 'Introducing Our Latest Innovation — {{campaignName}}',
    htmlContent: wrap(`
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b4a 100%); padding: 40px; text-align: center;">
        <p style="color: #c5a55a; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Now Available</p>
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Something New from<br>Knowith Capital</h1>
      </div>
      <div style="padding: 40px; color: #374151; font-size: 15px; line-height: 1.7;">
        <p>Dear {{firstName}},</p>
        <p>We're excited to announce the launch of our latest innovation — designed to elevate your investment experience.</p>
        <div style="background: #f0f9ff; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="color: #1e3a5f; margin-top: 0;">Key Highlights</h3>
          <ul style="padding-left: 20px; color: #1e40af;">
            <li style="margin-bottom: 8px;">AI-powered insights at your fingertips</li>
            <li style="margin-bottom: 8px;">Real-time portfolio tracking</li>
            <li style="margin-bottom: 8px;">Personalized recommendations</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #c5a55a 0%, #b8963e 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600;">Explore Now</a>
        </div>
      </div>
    `),
  },
];
