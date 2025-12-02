import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { providerType, zip } = req.body as { providerType?: string; zip?: string }
    if (!zip || typeof zip !== 'string') {
      return res.status(400).json({ error: 'zip is required' })
    }

    const taxonomyMap: Record<
      string,
      { desc: string; code: string; display: string }
    > = {
      cardiology: { desc: 'Cardiology', code: '207RC0000X', display: 'cardiologists' },
      cardiologist: { desc: 'Cardiology', code: '207RC0000X', display: 'cardiologists' },
      'family medicine': { desc: 'Family Medicine', code: '207Q00000X', display: 'family medicine providers' },
      'family physician': { desc: 'Family Medicine', code: '207Q00000X', display: 'family medicine providers' },
      neurology: { desc: 'Neurology', code: '2084N0400X', display: 'neurologists' },
      neurologist: { desc: 'Neurology', code: '2084N0400X', display: 'neurologists' },
      pulmonology: { desc: 'Pulmonary Disease', code: '207RP1001X', display: 'pulmonologists' },
      pulmonologist: { desc: 'Pulmonary Disease', code: '207RP1001X', display: 'pulmonologists' },
      gastroenterology: { desc: 'Gastroenterology', code: '207RG0100X', display: 'gastroenterologists' },
      gastroenterologist: { desc: 'Gastroenterology', code: '207RG0100X', display: 'gastroenterologists' },
      dermatology: { desc: 'Dermatology', code: '207N00000X', display: 'dermatologists' },
      dermatologist: { desc: 'Dermatology', code: '207N00000X', display: 'dermatologists' },
      psychiatry: { desc: 'Psychiatry', code: '2084P0800X', display: 'psychiatrists' },
      psychiatrist: { desc: 'Psychiatry', code: '2084P0800X', display: 'psychiatrists' },
      pediatrics: { desc: 'Pediatrics', code: '208000000X', display: 'pediatricians' },
      pediatrician: { desc: 'Pediatrics', code: '208000000X', display: 'pediatricians' },
      endocrinology: { desc: 'Endocrinology, Diabetes & Metabolism', code: '207RE0101X', display: 'endocrinologists' },
      endocrinologist: { desc: 'Endocrinology, Diabetes & Metabolism', code: '207RE0101X', display: 'endocrinologists' },
      nephrology: { desc: 'Nephrology', code: '207RN0300X', display: 'nephrologists' },
      nephrologist: { desc: 'Nephrology', code: '207RN0300X', display: 'nephrologists' },
      hematology: { desc: 'Hematology', code: '207RH0000X', display: 'hematologists' },
      rheumatology: { desc: 'Rheumatology', code: '207RR0500X', display: 'rheumatologists' },
      oncology: { desc: 'Medical Oncology', code: '207RX0202X', display: 'oncologists' },
      oncologist: { desc: 'Medical Oncology', code: '207RX0202X', display: 'oncologists' },
      urology: { desc: 'Urology', code: '208800000X', display: 'urologists' },
      urologist: { desc: 'Urology', code: '208800000X', display: 'urologists' },
      orthopedics: { desc: 'Orthopaedic Surgery', code: '207X00000X', display: 'orthopedic surgeons' },
      orthopedist: { desc: 'Orthopaedic Surgery', code: '207X00000X', display: 'orthopedic surgeons' },
      ent: { desc: 'Otolaryngology', code: '207Y00000X', display: 'ENT specialists' },
      otolaryngology: { desc: 'Otolaryngology', code: '207Y00000X', display: 'ENT specialists' },
    }

    const key = (providerType || '').trim().toLowerCase()
    const specialty = taxonomyMap[key] || taxonomyMap[key.replace(/s$/, '')] || taxonomyMap['family medicine']

    const taxonomyDesc = encodeURIComponent(specialty.desc)
    const taxonomyCode = encodeURIComponent(specialty.code)
    const postal = encodeURIComponent(zip.trim())
    const baseUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&postal_code=${postal}&country_code=US&limit=25`

    const primaryUrl = `${baseUrl}&taxonomy_description=${taxonomyDesc}`
    console.info('[providers] NPI fetch start', { providerType: providerType || 'family medicine', zip, taxonomy: specialty.desc })
    const resp = await fetch(primaryUrl)
    console.info('[providers] NPI response (desc)', { status: resp.status })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('[providers] NPI error', { status: resp.status, body: text })
      return res.status(502).json({ error: 'Failed to fetch providers', detail: text })
    }

    const data = await resp.json()
    let results = Array.isArray(data.results) ? data.results : []

    // Fallback: if no results, retry using taxonomy code
    if (results.length === 0) {
      const codeUrl = `${baseUrl}&taxonomy=${taxonomyCode}`
      console.info('[providers] NPI retry with taxonomy code', { taxonomy: specialty.code })
      const respCode = await fetch(codeUrl)
      console.info('[providers] NPI response (code)', { status: respCode.status })
      if (respCode.ok) {
        const dataCode = await respCode.json()
        results = Array.isArray(dataCode.results) ? dataCode.results : results
      } else {
        const text = await respCode.text()
        console.error('[providers] NPI error (code)', { status: respCode.status, body: text })
      }
    }

    const simplified = results.slice(0, 6).map((p: any) => {
      const basic = p.basic || {}
      const addresses = Array.isArray(p.addresses) ? p.addresses : []
      const location = addresses.find((a: any) => a.address_purpose === 'LOCATION') || addresses[0] || {}

      const providerName =
        basic.organization_name ||
        [basic.first_name, basic.last_name].filter(Boolean).join(' ').trim() ||
        'Unknown provider'

      const practiceName = basic.organization_name || null
      const address = [location.address_1, location.city, location.state, location.postal_code]
        .filter(Boolean)
        .join(', ')
      const phone = location.telephone_number || basic.telephone_number || null

      return {
        name: providerName,
        practiceName,
        address: address || 'Address not available',
        phone: phone || undefined,
      }
    })

    console.info('[providers] NPI success', { count: simplified.length })
    return res.status(200).json(simplified)
  } catch (error) {
    console.error('[providers] unexpected error', error)
    return res.status(500).json({ error: 'Unexpected error fetching providers' })
  }
}
