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
  }
]

