export type MedicalItem = {
  id: string
  title: string
  summary: string
  typical_symptoms: string[]
  red_flags: string[]
  guidance: string
}

export const MEDICAL_KNOWLEDGE: MedicalItem[] = [
  {
    id: 'cardiac_emergency',
    title: 'Cardiac Emergency Pattern',
    summary: 'Chest pain combined with shortness of breath may indicate a cardiac emergency requiring immediate attention.',
    typical_symptoms: ['chest pain', 'shortness of breath', 'pressure in chest', 'pain radiating to arm or jaw'],
    red_flags: ['severe chest pain', 'shortness of breath at rest', 'pain radiating to left arm', 'nausea with chest pain'],
    guidance: 'This combination of symptoms requires immediate medical evaluation. If symptoms are severe or worsening, seek emergency care immediately. Do not delay seeking medical attention for chest pain with breathing difficulties.'
  },
  {
    id: 'respiratory_infection',
    title: 'Respiratory Infection Pattern',
    summary: 'Fever with cough and respiratory symptoms suggests a possible respiratory infection.',
    typical_symptoms: ['fever', 'cough', 'shortness of breath', 'fatigue', 'body aches'],
    red_flags: ['high fever persisting', 'difficulty breathing', 'chest pain with cough', 'severe fatigue'],
    guidance: 'Monitor symptoms closely. Rest, stay hydrated, and use over-the-counter fever reducers if appropriate. Seek medical care if breathing becomes difficult, fever persists beyond 3-4 days, or symptoms worsen significantly.'
  },
  {
    id: 'gastrointestinal_distress',
    title: 'Gastrointestinal Distress Pattern',
    summary: 'Abdominal pain with vomiting or nausea may indicate gastrointestinal issues.',
    typical_symptoms: ['abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'loss of appetite'],
    red_flags: ['severe abdominal pain', 'blood in vomit or stool', 'persistent vomiting', 'signs of dehydration'],
    guidance: 'Stay hydrated with small sips of water or electrolyte solutions. Avoid solid foods initially. Seek medical care if pain is severe, persistent, or if there are signs of dehydration or blood in vomit/stool.'
  },
  {
    id: 'meningeal_signs',
    title: 'Meningeal Signs Pattern',
    summary: 'Neck stiffness with headache and fever may indicate serious neurological conditions.',
    typical_symptoms: ['neck stiffness', 'headache', 'fever', 'sensitivity to light', 'nausea'],
    red_flags: ['severe neck stiffness', 'high fever with headache', 'altered mental status', 'rash with fever'],
    guidance: 'This combination requires urgent medical evaluation. Do not delay seeking care, especially if symptoms are severe or rapidly worsening. This may indicate conditions requiring immediate treatment.'
  },
  {
    id: 'syncope_pattern',
    title: 'Syncope or Fainting Pattern',
    summary: 'Dizziness, lightheadedness, or fainting episodes may indicate various underlying conditions.',
    typical_symptoms: ['dizziness', 'lightheadedness', 'fainting', 'weakness', 'nausea'],
    red_flags: ['fainting with chest pain', 'fainting during exercise', 'recurrent fainting', 'loss of consciousness'],
    guidance: 'If fainting occurs, seek medical evaluation to determine the cause. Avoid activities that could be dangerous if fainting recurs. Stay hydrated and avoid sudden position changes. Immediate evaluation needed if fainting is recurrent or associated with chest pain.'
  },
  {
    id: 'dehydration_pattern',
    title: 'Dehydration Pattern',
    summary: 'Signs of dehydration including reduced urination, dry mouth, and fatigue.',
    typical_symptoms: ['reduced urination', 'dry mouth', 'thirst', 'fatigue', 'dizziness', 'dark urine'],
    red_flags: ['severe thirst', 'no urination for 8+ hours', 'confusion', 'rapid heart rate', 'sunken eyes'],
    guidance: 'Increase fluid intake gradually. Use oral rehydration solutions if available. Seek immediate care if signs are severe, especially in children or elderly individuals, or if confusion or rapid heart rate develops.'
  },
  {
    id: 'urinary_symptoms',
    title: 'Urinary Tract Symptoms Pattern',
    summary: 'Painful urination with frequency and urgency may indicate urinary tract issues.',
    typical_symptoms: ['painful urination', 'frequent urination', 'urgency', 'lower abdominal pain', 'blood in urine'],
    red_flags: ['fever with urinary symptoms', 'severe pain', 'flank pain', 'nausea with urinary symptoms'],
    guidance: 'Increase water intake. Seek medical evaluation, especially if fever develops or pain is severe. This may require antibiotic treatment if infection is present.'
  },
  {
    id: 'allergic_reaction',
    title: 'Allergic Reaction Pattern',
    summary: 'Rash, itching, or swelling may indicate an allergic reaction.',
    typical_symptoms: ['rash', 'itching', 'swelling', 'hives', 'redness'],
    red_flags: ['difficulty breathing', 'swelling of face or throat', 'rapid onset', 'dizziness with rash'],
    guidance: 'If breathing is affected or throat swelling occurs, seek emergency care immediately. For mild reactions, avoid the trigger and consider antihistamines. Monitor closely for worsening symptoms.'
  },
  {
    id: 'headache_pattern',
    title: 'Severe Headache Pattern',
    summary: 'Severe or sudden onset headaches may require medical evaluation.',
    typical_symptoms: ['severe headache', 'sudden onset', 'throbbing pain', 'sensitivity to light', 'nausea'],
    red_flags: ['sudden severe headache', 'headache with neck stiffness', 'headache after head injury', 'vision changes'],
    guidance: 'Sudden severe headaches or headaches with neurological symptoms require immediate evaluation. For chronic headaches, track patterns and triggers. Seek urgent care if headache is "worst ever" or associated with other concerning symptoms.'
  },
  {
    id: 'musculoskeletal_pain',
    title: 'Musculoskeletal Pain Pattern',
    summary: 'Joint or muscle pain with limited mobility suggests musculoskeletal issues.',
    typical_symptoms: ['joint pain', 'muscle pain', 'stiffness', 'limited range of motion', 'swelling'],
    red_flags: ['severe pain', 'inability to bear weight', 'deformity', 'numbness or tingling'],
    guidance: 'Rest the affected area. Apply ice for acute injuries, heat for chronic stiffness. Seek evaluation if pain is severe, there is inability to use the limb, or if numbness/tingling develops.'
  },
  {
    id: 'respiratory_distress',
    title: 'Respiratory Distress Pattern',
    summary: 'Difficulty breathing with rapid breathing or wheezing requires attention.',
    typical_symptoms: ['difficulty breathing', 'rapid breathing', 'wheezing', 'chest tightness', 'cough'],
    red_flags: ['severe difficulty breathing', 'inability to speak in sentences', 'blue lips or nails', 'rapid worsening'],
    guidance: 'Seek immediate medical care if breathing is severely affected. Use prescribed inhalers if available. This is a medical emergency if breathing becomes extremely difficult or if lips/nails turn blue.'
  },
  {
    id: 'fever_pattern',
    title: 'Fever Pattern',
    summary: 'Elevated body temperature with associated symptoms may indicate infection or other conditions.',
    typical_symptoms: ['fever', 'chills', 'sweating', 'fatigue', 'body aches'],
    red_flags: ['very high fever', 'fever lasting more than 3-4 days', 'fever with rash', 'fever with severe headache'],
    guidance: 'Monitor temperature regularly. Stay hydrated and rest. Use fever reducers as appropriate. Seek medical care if fever is very high, persists beyond 3-4 days, or is associated with other concerning symptoms.'
  },
  {
    id: 'abdominal_emergency',
    title: 'Abdominal Emergency Pattern',
    summary: 'Severe abdominal pain with other symptoms may indicate serious conditions.',
    typical_symptoms: ['severe abdominal pain', 'nausea', 'vomiting', 'fever', 'tenderness'],
    red_flags: ['sudden severe pain', 'rigid abdomen', 'fever with severe pain', 'inability to keep fluids down'],
    guidance: 'Severe or sudden abdominal pain requires immediate medical evaluation. Do not eat or drink until evaluated. This may indicate conditions requiring urgent surgical evaluation.'
  },
  {
    id: 'hives_allergic_reaction',
    title: 'Hives and Allergic Reaction Pattern',
    summary: 'Hives can result from allergic reactions, infections, medications, or environmental triggers. Rapid onset with breathing issues can indicate a medical emergency.',
    typical_symptoms: [
      'raised itchy welts',
      'red or skin-colored patches',
      'swelling of lips or eyelids',
      'itching',
      'burning sensation',
    ],
    red_flags: [
      'difficulty breathing',
      'tightness in throat',
      'swelling of tongue or face',
      'dizziness or fainting',
      'hives spreading rapidly',
    ],
    guidance:
      'Most cases of hives resolve on their own or with antihistamines. Seek immediate medical care if hives occur with breathing difficulty, swelling of the throat or tongue, or signs of anaphylaxis.',
  },
  {
  id: 'migraine_pattern',
  title: 'Migraine Pattern',
  summary: 'Throbbing unilateral headache with sensitivity to light and nausea.',
  typical_symptoms: ['throbbing headache', 'light sensitivity', 'sound sensitivity', 'nausea', 'visual aura'],
  red_flags: ['sudden “worst headache”', 'weakness on one side', 'confusion', 'fever with stiff neck'],
  guidance: 'Rest in a dark room, hydrate, and consider migraine-specific medications if prescribed. Seek medical care if the headache is sudden, severe, or associated with neurological symptoms.'
},
{
  id: 'sinus_infection_pattern',
  title: 'Sinus Infection Pattern',
  summary: 'Facial pressure with congestion and headache may suggest sinus inflammation.',
  typical_symptoms: ['facial pressure', 'nasal congestion', 'headache', 'post-nasal drip', 'thick nasal mucus'],
  red_flags: ['high fever', 'vision changes', 'severe headache', 'symptoms lasting more than 10 days'],
  guidance: 'Use warm compresses, saline rinses, and hydration. Seek care if symptoms persist beyond 10 days or worsen suddenly.'
},
{
  id: 'panic_attack_pattern',
  title: 'Panic Attack Pattern',
  summary: 'Sudden fear with chest tightness, racing heart, and shortness of breath.',
  typical_symptoms: ['racing heart', 'chest tightness', 'shortness of breath', 'trembling', 'sense of impending doom'],
  red_flags: ['chest pain lasting >10 minutes', 'fainting', 'confusion', 'severe shortness of breath'],
  guidance: 'Slow breathing, grounding techniques, and reassurance may help. Seek emergency care if symptoms resemble cardiac issues or do not resolve.'
},
{
  id: 'asthma_exacerbation',
  title: 'Asthma Exacerbation Pattern',
  summary: 'Wheezing and difficulty breathing due to airway inflammation.',
  typical_symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'difficulty speaking'],
  red_flags: ['inability to speak full sentences', 'blue lips', 'rapid worsening', 'no improvement after inhaler use'],
  guidance: 'Use prescribed inhalers immediately. Seek emergency care if symptoms do not improve or worsen.'
},
{
  id: 'cold_vs_flu_pattern',
  title: 'Cold vs Flu Pattern',
  summary: 'Helps differentiate mild cold symptoms from more severe flu presentations.',
  typical_symptoms: ['fever', 'chills', 'cough', 'sore throat', 'fatigue'],
  red_flags: ['shortness of breath', 'persistent high fever', 'chest pain', 'severe dehydration'],
  guidance: 'Rest, hydrate, and use OTC symptom relief. Seek care for worsening breathing, persistent fever, or dehydration.'
},
{
  id: 'food_poisoning_pattern',
  title: 'Food Poisoning Pattern',
  summary: 'Vomiting and diarrhea shortly after eating contaminated food.',
  typical_symptoms: ['vomiting', 'diarrhea', 'abdominal cramps', 'nausea', 'fatigue'],
  red_flags: ['bloody stool', 'vomiting for more than 24 hours', 'signs of dehydration', 'fever above 102°F'],
  guidance: 'Hydrate with electrolyte fluids. Avoid solid foods initially. Seek care if dehydration or persistent symptoms occur.'
},
{
  id: 'appendicitis_pattern',
  title: 'Appendicitis Pattern',
  summary: 'Pain starting near the navel and moving to the right lower abdomen.',
  typical_symptoms: ['right lower abdominal pain', 'nausea', 'loss of appetite', 'fever', 'rebound tenderness'],
  red_flags: ['severe pain', 'rigid abdomen', 'vomiting with fever', 'rapid worsening'],
  guidance: 'Possible surgical emergency. Seek immediate care if symptoms suggest appendicitis.'
},
{
  id: 'stroke_pattern',
  title: 'Stroke Warning Pattern',
  summary: 'Sudden neurological symptoms indicating possible stroke.',
  typical_symptoms: ['weakness on one side', 'slurred speech', 'vision loss', 'confusion', 'sudden severe headache'],
  red_flags: ['sudden neurological deficits', 'inability to speak', 'facial drooping', 'loss of coordination'],
  guidance: 'Call emergency services immediately. Time-sensitive emergency requiring immediate evaluation.'
},
{
  id: 'covid_like_pattern',
  title: 'COVID-Like Symptom Pattern',
  summary: 'Respiratory symptoms with fever and fatigue may resemble viral illness.',
  typical_symptoms: ['fever', 'dry cough', 'fatigue', 'loss of smell', 'body aches'],
  red_flags: ['severe difficulty breathing', 'persistent chest pain', 'new confusion', 'bluish lips'],
  guidance: 'Test if possible. Isolate, hydrate, and monitor symptoms. Seek emergency care for trouble breathing or chest pain.'
},
{
  id: 'ear_infection_pattern',
  title: 'Ear Infection Pattern',
  summary: 'Ear pain with decreased hearing and possible fever.',
  typical_symptoms: ['ear pain', 'hearing loss', 'ear pressure', 'fever', 'drainage from ear'],
  red_flags: ['severe pain', 'swelling behind ear', 'stiff neck', 'persistent fever'],
  guidance: 'Analgesics and warm compresses can help. Seek medical evaluation for persistent pain or fever.'
},
{
  id: 'skin_infection_pattern',
  title: 'Skin Infection Pattern',
  summary: 'Redness, warmth, and swelling of skin may indicate infection.',
  typical_symptoms: ['redness', 'swelling', 'warmth', 'tenderness', 'pus or drainage'],
  red_flags: ['rapidly spreading redness', 'fever', 'severe pain', 'black patches of skin'],
  guidance: 'Keep clean and monitor for spreading. Seek care if redness expands or fever develops.'
},
{
  id: 'concussion_pattern',
  title: 'Concussion Pattern',
  summary: 'Head trauma causing headache, confusion, or dizziness.',
  typical_symptoms: ['headache', 'dizziness', 'confusion', 'nausea', 'sensitivity to light'],
  red_flags: ['loss of consciousness', 'vomiting repeatedly', 'worsening headache', 'unequal pupils'],
  guidance: 'Rest and avoid screens. Seek urgent care if severe symptoms or repeated vomiting occur.'
},
{
  id: 'lower_back_pain',
  title: 'Lower Back Pain Pattern',
  summary: 'Mechanical back pain from lifting, strain, or posture.',
  typical_symptoms: ['lower back pain', 'stiffness', 'limited movement', 'muscle spasms'],
  red_flags: ['numbness in legs', 'loss of bladder control', 'severe weakness', 'pain after trauma'],
  guidance: 'Rest, heat/ice, and gentle movement. Seek care if neurological symptoms appear.'
},
{
  id: 'pregnancy_related_symptoms',
  title: 'Pregnancy-Related Symptom Pattern',
  summary: 'Nausea, fatigue, breast tenderness, or missed period may suggest early pregnancy.',
  typical_symptoms: ['missed period', 'nausea', 'fatigue', 'breast tenderness', 'increased urination'],
  red_flags: ['severe abdominal pain', 'heavy bleeding', 'dizziness', 'shoulder pain'],
  guidance: 'Consider home testing. Seek immediate care for heavy bleeding or severe pain due to risk of ectopic pregnancy.'
},
{
  id: 'depression_pattern',
  title: 'Depression Symptom Pattern',
  summary: 'Persistent low mood and loss of interest in activities.',
  typical_symptoms: ['sadness', 'loss of interest', 'fatigue', 'sleep changes', 'poor concentration'],
  red_flags: ['thoughts of self-harm', 'inability to function', 'severe withdrawal'],
  guidance: 'Seek mental health evaluation. Supportive therapy and medical treatment may help. Seek urgent help for suicidal thoughts.'
}

]
