<?php

return [
    'password_hash' => env('FAMILY_ACCESS_PASSWORD_HASH'),
    'max_attempts' => (int) env('FAMILY_ACCESS_MAX_ATTEMPTS', 5),
    'decay_seconds' => (int) env('FAMILY_ACCESS_DECAY_SECONDS', 900),
];
