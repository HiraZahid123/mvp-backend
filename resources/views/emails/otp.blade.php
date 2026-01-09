<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code - Oflem</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #F8F8F8;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-top: 40px;
            margin-bottom: 40px;
        }
        .header {
            background-color: #FACC15; /* Gold Accent */
            padding: 30px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 900;
            color: #1a1a1a;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            text-decoration: none;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
            color: #1a1a1a;
        }
        .h1 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 10px;
            color: #1a1a1a;
        }
        .text {
            font-size: 16px;
            line-height: 1.6;
            color: #666666;
            margin-bottom: 30px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 8px;
            color: #1a1a1a;
            background-color: #FACC15;
            padding: 20px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 30px;
        }
        .footer {
            background-color: #1a1a1a;
            padding: 20px;
            text-align: center;
            color: #9CA3AF;
            font-size: 12px;
        }
        .expire-text {
            font-size: 14px;
            color: #999;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OFLEM</div>
        </div>
        <div class="content">
            <h1 class="h1">Verify Your Account</h1>
            <p class="text">
                Use the code below to complete your verification process. <br>
                For your security, do not share this code with anyone.
            </p>
            
            <div class="otp-code">
                {{ $otp }}
            </div>

            <p class="expire-text">
                This code will expire in 10 minutes.
            </p>

            <p class="text" style="margin-top: 30px; font-size: 14px;">
                If you didn't request this code, you can safely ignore this email.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Oflem. All rights reserved. Code lazy, live busy.
        </div>
    </div>
</body>
</html>
