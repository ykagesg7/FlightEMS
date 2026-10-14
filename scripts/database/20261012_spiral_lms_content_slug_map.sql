-- Spiral LMS: MDX meta.slug -> learning_contents.id (all slugs referenced by L1/L2 seed).
BEGIN;

CREATE TABLE IF NOT EXISTS public.spiral_content_slug_map (
  content_slug text PRIMARY KEY,
  learning_content_id text NOT NULL REFERENCES public.learning_contents (id) ON DELETE RESTRICT
);

INSERT INTO public.spiral_content_slug_map (content_slug, learning_content_id)
VALUES
  ('/articles/answer-first-word', '4.1.3_AnswerFirstWord'),
  ('/articles/chores-are-the-job', '4.1.1_ChoresAreTheJob'),
  ('/articles/just-enough-is-not-enough', '4.1.5_JustEnoughIsNotEnough'),
  ('/articles/put-a-frame-on-failure', '4.2.2_PutAFrameOnFailure'),
  ('/articles/say-expectations', '4.1.4_SayExpectations'),
  ('/articles/speak-before-asked', '4.1.2_SpeakBeforeAsked'),
  ('/articles/take-the-gain-from-feedback', '4.2.3_TakeTheGainFromFeedback'),
  ('/articles/thinking-stamina', '4.2.5_ThinkingStamina'),
  ('/articles/turn-feedback-into-action', '4.2.1_TurnFeedbackIntoAction'),
  ('/articles/yes-has-a-short-shelf-life', '4.2.4_YesHasAShortShelfLife'),
  ('cp-1-1-area-and-purpose', 'CP-1-1_AreaAndPurpose'),
  ('cp-1-2-energy', 'CP-1-2_Energy'),
  ('cp-1-3-controls-g-pio', 'CP-1-3_ControlsGPio'),
  ('cp-2-1-deep-stall', 'CP-2-1_DeepStall'),
  ('cp-2-2-accelerated-stall', 'CP-2-2_AcceleratedStall'),
  ('cp-3-2-pattern-ats', 'CP-3-2_PatternATS'),
  ('michizane-briefing', 'L1-Q4-1_MichizaneBriefing'),
  ('path-to-pilot', 'L1-Q3-1_PathToPilot'),
  ('ppl-1-1-1-temperature-basics', 'PPL-1-1-1_TemperatureBasics'),
  ('ppl-1-1-10-takeoff-landing-performance', 'PPL-1-1-10_TakeoffLandingPerformance'),
  ('ppl-1-1-11-control-surfaces', 'PPL-1-1-11_ControlSurfaces'),
  ('ppl-1-1-2-airspeed-basics', 'PPL-1-1-2_AirspeedBasics'),
  ('ppl-1-1-3-bernoulli-principle', 'PPL-1-1-3_BernoulliPrinciple'),
  ('ppl-1-1-4-drag-basics', 'PPL-1-1-4_DragBasics'),
  ('ppl-1-1-5-axes-stability', 'PPL-1-1-5_AxesStability'),
  ('ppl-1-1-6-stall-spin', 'PPL-1-1-6_StallSpin'),
  ('ppl-1-1-7-vn-diagram', 'PPL-1-1-7_VnDiagram'),
  ('ppl-1-1-8-propeller-basics', 'PPL-1-1-8_PropellerBasics'),
  ('ppl-1-1-9-flight-performance', 'PPL-1-1-9_FlightPerformance'),
  ('ppl-2-3-2-metar-taf-and-weather-reports', 'PPL-2-3-2_MetarTafAndWeatherReports'),
  ('ppl-3-1-3-aeronautical-charts-basics', 'PPL-3-1-3_AeronauticalChartsBasics'),
  ('ppl-3-2-1-pilotage-and-position-fix', 'PPL-3-2-1_PilotageAndPositionFix'),
  ('ppl-3-3-1-vfr-operations-and-airspace', 'PPL-3-3-1_VfrOperationsAndAirspace'),
  ('ppl-3-3-2-spatial-disorientation-basics', 'PPL-3-3-2_SpatialDisorientationBasics'),
  ('ppl-4-1-1-air-traffic-services-overview', 'PPL-4-1-1_AirTrafficServicesOverview'),
  ('ppl-4-2-3-aerodrome-control-basics', 'PPL-4-2-3_AerodromeControlBasics'),
  ('ppl-5-1-1-aviation-law-definitions', 'PPL-5-1-1_AviationLawDefinitions'),
  ('ppl-5-1-2-chicago-convention-overview', 'PPL-5-1-2_ChicagoConventionOverview'),
  ('ppl-5-2-1-aircraft-nationality-and-registration', 'PPL-5-2-1_AircraftNationalityAndRegistration'),
  ('ppl-5-2-2-airworthiness-and-maintenance-overview', 'PPL-5-2-2_AirworthinessAndMaintenanceOverview'),
  ('ppl-5-3-1-pilot-certificate-basics', 'PPL-5-3-1_PilotCertificateBasics'),
  ('ppl-5-3-2-medical-certificate-basics', 'PPL-5-3-2_MedicalCertificateBasics'),
  ('ppl-5-3-3-aviation-english-requirements', 'PPL-5-3-3_AviationEnglishRequirements'),
  ('ppl-5-4-1-airspace-and-facilities-overview', 'PPL-5-4-1_AirspaceAndFacilitiesOverview'),
  ('ppl-5-4-2-captain-authority-and-preflight', 'PPL-5-4-2_CaptainAuthorityAndPreflight'),
  ('ppl-5-4-3-recurrent-proficiency-overview', 'PPL-5-4-3_RecurrentProficiencyOverview'),
  ('ppl-5-4-4-safety-endangering-prohibitions', 'PPL-5-4-4_SafetyEndangeringProhibitions'),
  ('ppl-5-4-5-accident-incident-reporting-basics', 'PPL-5-4-5_AccidentIncidentReportingBasics'),
  ('ppl-5-4-6-aerodrome-ground-operations-basics', 'PPL-5-4-6_AerodromeGroundOperationsBasics'),
  ('ppl-5-4-7-ifr-minimum-altitude-intro-for-ppl', 'PPL-5-4-7_IFRMinimumAltitudeIntroForPPL')
ON CONFLICT (content_slug) DO UPDATE SET
  learning_content_id = EXCLUDED.learning_content_id;

ALTER TABLE public.spiral_content_slug_map ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spiral_content_slug_map_select ON public.spiral_content_slug_map;
CREATE POLICY spiral_content_slug_map_select ON public.spiral_content_slug_map
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE ALL ON TABLE public.spiral_content_slug_map FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.spiral_content_slug_map TO anon, authenticated;

COMMIT;
