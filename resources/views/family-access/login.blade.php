<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="theme-color" content="#f4efe6">
    <title>Noraä — Accès familial</title>
    @vite(['resources/css/app.css'])
</head>
<body class="access-page">
<main class="access-card">
    <a class="back-link" href="{{ route('home') }}">← Retour à l’accueil</a>
    <div class="brand-mark" aria-hidden="true">N</div>
    <p class="eyebrow">Espace privé</p>
    <h1>Accès à l’arbre familial</h1>
    <p>Cette page est réservée à la famille. Saisissez le mot de passe qui vous a été communiqué.</p>

    <form method="post" action="{{ route('family-access.authenticate') }}" class="access-form">
        @csrf
        <label for="family-password">Mot de passe familial</label>
        <input
            id="family-password"
            name="password"
            type="password"
            required
            autofocus
            autocomplete="current-password"
            aria-describedby="password-help @error('password') password-error @enderror"
            @error('password') aria-invalid="true" @enderror
        >
        <p id="password-help" class="form-help">Les tentatives répétées sont temporairement bloquées.</p>
        @error('password')
            <p id="password-error" class="form-error" role="alert">{{ $message }}</p>
        @enderror
        <button type="submit" class="primary-button">Entrer</button>
    </form>
</main>
</body>
</html>
