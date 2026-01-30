<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Mission>
 */
class MissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'location' => 'Geneva, Switzerland',
            'lat' => 46.2044,
            'lng' => 6.1432,
            'budget' => $this->faker->numberBetween(50, 500),
            'price_type' => 'fixed',
            'status' => 'OUVERTE',
        ];
    }
}
