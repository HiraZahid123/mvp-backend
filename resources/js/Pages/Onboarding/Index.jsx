import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function Index({ existingProfile = null }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(existingProfile ? 2 : 1); // Start at review if profile exists
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        description: '',
        bio: existingProfile?.bio || '',
        years_experience: existingProfile?.years_experience || 0,
        main_category: existingProfile?.main_category || '',
        skills: existingProfile?.skills?.map(s => ({ 
            name: s.name, 
            proficiency: s.pivot?.proficiency_level || 'intermediate' 
        })) || [],
        raw_analysis: existingProfile?.raw_ai_analysis || null
    });

    const handleAnalyze = async () => {
        if (!data.description || data.description.length < 20) {
            setAnalysisError(t('Please provide more details (min 20 chars).'));
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError('');

        try {
            const response = await axios.post(route('onboarding.analyze'), { description: data.description });
            const analysis = response.data;
            
            setData(prev => ({
                ...prev,
                bio: analysis.professional_bio || '',
                years_experience: analysis.years_experience || 0,
                main_category: analysis.main_category || 'General',
                skills: analysis.skills || [],
                raw_analysis: analysis
            }));

            setStep(2);
        } catch (error) {
            setAnalysisError(t('Failed to analyze. Please try again or fill manually.'));
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const removeSkill = (index) => {
        const newSkills = [...data.skills];
        newSkills.splice(index, 1);
        setData('skills', newSkills);
    };

    return (
        <div className="min-h-screen bg-off-white-bg font-sans">
            <Head title={t('Provider Onboarding')} />
            <Header />

            <main className="max-w-3xl mx-auto py-16 px-6">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-primary-black mb-3">
                            {step === 1 ? t('Tell us about your expertise') : t('Review your profile')}
                        </h1>
                        <p className="text-gray-muted font-bold">
                            {step === 1 
                                ? t('Our AI will analyze your skills to match you with the right missions.') 
                                : t('We extracted this from your description. Does it look correct?')}
                        </p>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="description" value={t('Describe your services & experience')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full bg-off-white-bg border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[200px] transition-all"
                                    placeholder={t('Example: I have been a carpenter for 10 years, specializing in custom furniture and repairs. I also have experience with painting and drywall...')}
                                />
                                <InputError message={analysisError} className="mt-2" />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-5 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-md text-lg flex items-center justify-center gap-3"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="w-6 h-6 border-4 border-primary-black border-t-transparent rounded-full animate-spin"></span>
                                        {t('Analyzing...')}
                                    </>
                                ) : (
                                    <>
                                        ✨ {t('Analyze Profile')}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Bio */}
                            <div>
                                <InputLabel htmlFor="bio" value={t('Professional Bio')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    className="w-full bg-off-white-bg border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[100px]"
                                />
                                <InputError message={errors.bio} className="mt-2" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Experience */}
                                <div>
                                    <InputLabel htmlFor="years" value={t('Years of Experience')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                    <input
                                        type="number"
                                        id="years"
                                        value={data.years_experience}
                                        onChange={(e) => setData('years_experience', e.target.value)}
                                        className="w-full bg-off-white-bg border-gray-border rounded-full px-6 py-4 text-sm font-bold focus:border-gold-accent focus:ring-0"
                                    />
                                    <InputError message={errors.years_experience} className="mt-2" />
                                </div>

                                {/* Category */}
                                <div>
                                    <InputLabel htmlFor="category" value={t('Main Category')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                    <input
                                        type="text"
                                        id="category"
                                        value={data.main_category}
                                        onChange={(e) => setData('main_category', e.target.value)}
                                        className="w-full bg-off-white-bg border-gray-border rounded-full px-6 py-4 text-sm font-bold focus:border-gold-accent focus:ring-0"
                                    />
                                    <InputError message={errors.main_category} className="mt-2" />
                                </div>
                            </div>

                            {/* Skills Tag Cloud */}
                            <div>
                                <InputLabel value={t('Extracted Skills')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <div className="bg-off-white-bg rounded-[24px] p-6 border border-gray-border min-h-[100px] flex flex-wrap gap-3">
                                    {data.skills.map((skill, index) => (
                                        <div key={index} className="bg-white border border-gray-border px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                            <span className="font-bold text-sm text-primary-black">{skill.name}</span>
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                                skill.proficiency === 'expert' ? 'bg-gold-accent text-primary-black' : 
                                                skill.proficiency === 'beginner' ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {skill.proficiency}
                                            </span>
                                            <button 
                                                type="button" 
                                                onClick={() => removeSkill(index)}
                                                className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {data.skills.length === 0 && (
                                        <p className="text-gray-muted text-sm italic">{t('No skills detected. Try adding more detail to your description.')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 bg-white border-2 border-gray-border text-primary-black font-black rounded-full hover:bg-off-white-bg transition-all"
                                >
                                    {t('Back')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-4 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all shadow-xl"
                                >
                                    {processing ? t('Saving...') : t('Complete Profile')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
