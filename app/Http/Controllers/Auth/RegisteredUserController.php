<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use App\Services\OTPService;
use App\Services\GeocodingService;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    protected OTPService $otpService;
    protected GeocodingService $geocodingService;

    public function __construct(OTPService $otpService, GeocodingService $geocodingService)
    {
        $this->otpService = $otpService;
        $this->geocodingService = $geocodingService;
    }

    /**
     * Display the Welcome/Gateway screen with social login options
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Display the manual registration form
     */
    public function createManual(): Response
    {
        return Inertia::render('Auth/RegisterManual');
    }

    /**
     * Handle manual email registration (Legacy logic)
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        try {
            $otpVerification = $this->otpService->sendOTP($request->email, 'email', $user);
            session(['verification_token' => $otpVerification->token]);
            session(['verification_email' => $request->email]);
        } catch (\Exception $e) {
            logger()->error('Failed to send verification OTP: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        return redirect()->route('auth.verify-email-code');
    }

    /**
     * Handle advanced Client registration payload from ClientRegister.jsx
     */
    public function storeClient(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'city'       => 'required|string|max:150',
            'email'      => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone'      => 'required|string',
            'password'   => ['required', 'confirmed', 'min:8'],
        ]);

        // Geocode city for discoverability
        $coordinates = $this->geocodingService->geocode($request->city);

        $user = User::create([
            'name'                 => trim($request->first_name . ' ' . $request->last_name),
            'email'                => $request->email,
            'phone'                => str_replace(' ', '', $request->phone),
            'phone_country_code'   => '+41',
            'password'             => Hash::make($request->password),
            'role_type'            => 'client',
            'last_selected_role'   => 'client',
            'location_address'     => $request->city,
            'location_lat'         => $coordinates['lat'] ?? null,
            'location_lng'         => $coordinates['lng'] ?? null,
        ]);

        event(new Registered($user));

        // Start OTP verification session
        session(['user_id' => $user->id]);

        try {
            $otpVerification = $this->otpService->sendOTP($request->email, 'email', $user);
            session(['otp_token'  => $otpVerification->token]);
            session(['otp_method' => 'email']);
        } catch (\Exception $e) {
            logger()->error('Failed to send verification OTP: ' . $e->getMessage());
        }

        return redirect()->route('auth.verify-otp');
    }

    /**
     * Handle advanced Provider registration payload from Register.jsx
     */
    public function storeProvider(Request $request): RedirectResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string',
            'password' => ['required', 'confirmed', 'min:8'],
            'mode' => 'required|in:standard,remote',
            'city' => 'required|string',
            'category' => 'required|string',
            'experience' => 'required|string',
            'radius' => 'required|integer|min:5|max:100',
            'bio' => 'required|string',
            'hourly_rate' => 'required|numeric|min:0',
            'avs_number' => 'required_if:mode,standard|nullable|string|regex:/^756\.\d{4}\.\d{4}\.\d{2}$/',
            'iban' => 'nullable|string',
            'photo' => 'required|image|max:10240',
            'id_document' => 'required_if:mode,standard|nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'address_proof' => 'required_if:mode,standard|nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'work_permit' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($validator->fails()) {
            logger()->warning('Provider registration validation failed', [
                'errors' => $validator->errors()->toArray(),
                'input_keys' => $request->keys(),
                'avs_provided' => $request->avs_number
            ]);
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();


        // Geocode city for discoverability
        $coordinates = $this->geocodingService->geocode($request->city);

        DB::beginTransaction();
        $photoPath = $idPath = $addressPath = $permitPath = null;
        try {
            // Handle profile photo
            $photoPath = $request->file('photo')->store('profile_photos', 'public');

            $user = User::create([
                'name' => trim($request->first_name . ' ' . $request->last_name),
                'email' => $request->email,
                'phone' => preg_replace('/[^0-9]/', '', $request->phone),
                'phone_country_code' => '+41',
                'password' => Hash::make($request->password),
                'role_type' => 'provider',
                'last_selected_role' => 'provider',
                'location_address' => $request->city ?? null,
                'location_lat' => $coordinates['lat'] ?? null,
                'location_lng' => $coordinates['lng'] ?? null,
                'discovery_radius_km' => $request->radius ?? 15,
                'profile_photo' => $photoPath,
            ]);

            // Handle verification documents
            $idPath = $request->hasFile('id_document') ? $request->file('id_document')->store('verification_docs/identity', 'public') : null;
            $addressPath = $request->hasFile('address_proof') ? $request->file('address_proof')->store('verification_docs/address', 'public') : null;
            $permitPath = $request->hasFile('work_permit') ? $request->file('work_permit')->store('verification_docs/permit', 'public') : null;

            \App\Models\ProviderProfile::create([
                'user_id' => $user->id,
                'bio' => $request->bio,
                'years_experience' => $request->experience ?? 'Moins de 2 ans',
                'main_category' => $request->category,
                'avs_number' => $request->avs_number,
                'hourly_rate' => $request->hourly_rate,
                'iban_encrypted' => $request->iban ? Crypt::encryptString($request->iban) : null,
                'id_document_path' => $idPath,
                'address_proof_path' => $addressPath,
                'work_permit_path' => $permitPath,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            // Delete uploaded files if DB fails, filtering out any null paths
            $pathsToDelete = array_filter([$photoPath, $idPath, $addressPath, $permitPath]);
            if (!empty($pathsToDelete)) {
                Storage::disk('public')->delete($pathsToDelete);
            }
            return back()->withErrors(['general' => 'Failed to create provider profile: ' . $e->getMessage()]);
        }

        event(new Registered($user));

        session(['user_id' => $user->id]);

        try {
            $otpVerification = $this->otpService->sendOTP($request->email, 'email', $user);
            session(['otp_token' => $otpVerification->token]);
            session(['otp_method' => 'email']);
        } catch (\Exception $e) {
            logger()->error('Failed to send verification OTP: ' . $e->getMessage());
        }

        return redirect()->route('auth.verify-otp');
    }
}
