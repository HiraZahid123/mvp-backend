<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification OFLEM</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #FDFBF7;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #FFFFFF;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            font-size: 24px;
            color: #000000;
            margin-bottom: 16px;
            font-weight: 700;
        }
        p {
            font-size: 16px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .code-box {
            background: #FDFBF7;
            border: 2px solid #C57B67;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            margin: 32px 0;
        }
        .code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #C57B67;
            font-family: 'Courier New', monospace;
        }
        .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #E5E5E5;
            font-size: 14px;
            color: #999999;
            text-align: center;
        }
        .brand {
            color: #C57B67;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1><span class="brand">OFLEM</span></h1>
        </div>
        
        <h1>Votre code de vérification</h1>
        <p>Bienvenue sur OFLEM ! Utilisez le code ci-dessous pour vérifier votre adresse email et finaliser votre inscription.</p>
        
        <div class="code-box">
            <div class="code">{{ $code }}</div>
        </div>
        
        <p>Ce code expirera dans <strong>10 minutes</strong>.</p>
        <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
        
        <div class="footer">
            <p>Gérez votre temps comme un pro avec <span class="brand">OFLEM</span></p>
        </div>
    </div>
</body>
</html>
