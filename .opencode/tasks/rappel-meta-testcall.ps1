$ErrorActionPreference = 'Continue'

$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
$log = 'C:\Users\BY 4\AppData\Local\Temp\opencode\resume-meta-testcall.log'
$cli = 'C:\Users\BY 4\AppData\Roaming\ai.opencode.desktop\cli\2.1.3-x64\opencode-cli.exe'
$session = 'ses_e06e19e6dffeW480GA08eLLOtJ'
$project = 'C:\Users\BY 4\Desktop\nakhla-v3'

$prompt = @'
REPRISE AUTOMATIQUE — 22/11/2026 16:00 Africa/Tunis.

Verifie le compteur du test call Meta instagram_manage_insights sur :
https://developers.facebook.com/apps/978882541533257/test/?business_id=3683106625189136

- S'il est passe a 1 appel sur 1 : verifie que la section instagram_manage_insights passe en « Modifier », puis controle les 5 autorisations de la soumission.
- S'il est toujours a 0 sur 1 : ne fais rien d'autre et explique qu'on attend le delai Meta (24 h annoncees, tests valides 30 jours).

INTERDICTION ABSOLUE : ne pas cliquer sur « Envoyer pour examen », ne pas publier, ne pas soumettre, ne pas modifier de campagne, ne pas repondre a des commentaires, sans un nouvel accord explicite de l'utilisateur. Garde NakhlaMkgApp en « Non publiee ».
'@

$reminder = @'
RAPPEL META — 22/11/2026 16:00 (Tunis)

Verifier le compteur du test call instagram_manage_insights :
https://developers.facebook.com/apps/978882541533257/test/?business_id=3683106625189136

Objectif : 1 appel sur 1, puis section « Modifier ».
Ne pas soumettre sans accord explicite.
Journal : C:\Users\BY 4\AppData\Local\Temp\opencode\resume-meta-testcall.log
'@

Add-Content -LiteralPath $log -Value "=== DECLENCHEMENT $stamp ==="
Add-Content -LiteralPath $log -Value $reminder

Push-Location -LiteralPath $project
try {
    if (Test-Path -LiteralPath $cli) {
        & $cli run --session $session --model 'kimi/kimi-k2.7-code' $prompt *>&1 | ForEach-Object { Add-Content -LiteralPath $log -Value $_.ToString() }
        Add-Content -LiteralPath $log -Value "EXIT_CODE=$LASTEXITCODE"
    }
    else {
        Add-Content -LiteralPath $log -Value "CLI INTROUVABLE : $cli"
    }
}
catch {
    Add-Content -LiteralPath $log -Value "ERREUR : $($_.Exception.Message)"
}
finally {
    Pop-Location
}

Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show($reminder, 'Rappel Meta - 16:00 Tunis', 'OK', 'Information') | Out-Null
