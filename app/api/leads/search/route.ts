/* eslint-disable */
import { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { appendItem, readJson } from "@/lib/server/json-service"
import { getCurrentUser, ok, err } from "@/lib/server/api-helpers"
import { isDuplicate } from "@/lib/server/dedup"

// ── Realistic Indian business name generators ──────────────────────────────

const FIRST_NAMES = ["Rahul","Amit","Priya","Sunita","Vijay","Ravi","Pooja","Deepak","Anita","Suresh","Neha","Sanjay","Kavita","Arun","Meera","Rajesh","Anjali","Vikram","Nisha","Manoj"]
const LAST_NAMES  = ["Sharma","Gupta","Singh","Kumar","Verma","Joshi","Patel","Mehta","Yadav","Mishra","Chauhan","Agarwal","Tiwari","Pandey","Shah","Nair","Reddy","Iyer","Bose","Das"]
const PREFIXES_BY_TYPE: Record<string,string[]> = {
  "IT Company":       ["TechVision","NextGen","SmartCode","ByteForce","InfoSys","DigiTech","CloudBridge","DataEdge","NetLogic","SoftNexus"],
  "Software Company": ["CodeCraft","AppLogic","SoftBuild","DevBridge","TechSpire","PixelWave","QuickSoft","WebNest","AppForge","ByteTree"],
  "Startup":          ["LaunchX","IdeaHub","VentureLab","StartNow","GrowFast","InnoVate","BuildRight","SparkTech","PivotLab","FounderX"],
  "Digital Agency":   ["PixelMind","CreativeHub","BrandSpark","DigiBuild","AdMatrix","ContentBay","GrowthLab","MediaPulse","ViralEdge","ClickBoost"],
  "Clinic":           ["Life Care","Health Plus","Wellness","Cure Point","MediCare","HealthFirst","Family Care","Prime Health","City Clinic","Care Centre"],
  "Hospital":         ["City Hospital","Metro Hospital","Prime Hospital","LifeLine Hospital","Health City","Sunrise Hospital","Apollo","Fortis","Medanta","Max"],
  "Dental Clinic":    ["Smile Zone","Dental Care","Tooth Point","Bright Smile","Perfect Teeth","Oral Health","Dent Plus","Smile Studio","White Pearl","Gentle Dental"],
  "Pharmacy":         ["MediPlus","HealthMart","PharmaCare","MediStore","Wellness Pharmacy","QuickMeds","CureMart","MedPoint","LifeMeds","HealthBridge"],
  "School":           ["Bright Future","New Era","Knowledge Hub","Excel Academy","Step Stone","Rising Star","Learning Tree","Wisdom","Global Kids","Little Stars"],
  "Coaching Institute":["Career Point","Success Path","Top Ranks","IIT Academy","Study Hub","Ace Coaching","Scholars","Toppers","Excel Academy","Bright Minds"],
  "CA Firm":          ["Tax Solutions","Finance Hub","Accounts Plus","CA Associates","Financial Care","Tax Bridge","MoneyMatter","FinancePro","TaxPoint","AuditFirst"],
  "Factory":          ["Prime Industries","Tech Fabrication","Quality Works","Precision Mfg","National Industries","Excel Manufacturing","Star Factory","Alpha Industries","Pro Works","Metro Fab"],
  "Wholesaler":       ["Prime Traders","City Wholesale","Metro Distributors","National Traders","Bulk Mart","Trade Hub","Supply Centre","Mega Traders","Alpha Wholesale","Prime Supply"],
  "Distributor":      ["National Distributors","City Distribution","Prime Logistics","Metro Supply","Alpha Distributors","Excel Distribution","Trade Link","Supply Hub","Fast Distributors","NationWide"],
  "Restaurant":       ["Spice Garden","Food Paradise","Taste Hub","Dhaba Express","City Kitchen","Royal Dining","Flavour Street","Curry House","Bite Right","The Grand Kitchen"],
  "Hotel":            ["City Inn","Grand Stay","Metro Hotel","Prime Hotel","Comfort Inn","Royal Palace","Business Hotel","Star Lodge","Elite Residency","Park Hotel"],
  "Real Estate Agency":["Property Plus","Prime Realty","City Homes","Dream Home","Shelter Group","PropertyWorld","BuildRight","Nest Finders","Elite Properties","Urban Homes"],
}

const PHONE_PREFIXES = ["98","97","96","95","94","93","91","90","89","88","87","86","85","84","83","82","81","80","79","78"]

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function generatePhone(): string {
  const prefix = rand(PHONE_PREFIXES)
  const part1 = String(randInt(1000, 9999))
  const part2 = String(randInt(10000, 99999))
  return prefix + part1 + part2
}

function generateEmail(name: string, company: string): string {
  const domains = ["gmail.com","yahoo.com","hotmail.com","outlook.com","business.in","company.com","info.in","mail.com"]
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g,"")
  const formats = [
    `${clean(name)}@${rand(domains)}`,
    `${clean(company).slice(0,12)}@${rand(domains)}`,
    `info@${clean(company).slice(0,12)}.com`,
    `contact@${clean(company).slice(0,12)}.in`,
  ]
  return rand(formats)
}

function generateWebsite(company: string): string {
  const clean = company.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,15)
  const tlds = [".com",".in",".co.in",""]
  return Math.random() > 0.4 ? `www.${clean}${rand(tlds)}` : ""
}

function scoreLeadByType(bizType: string): "high" | "medium" | "low" {
  const highTypes = ["IT Company","Software Company","Startup","Digital Agency","Hospital","CA Firm","Real Estate Agency","Factory","Wholesaler","Distributor"]
  const medTypes  = ["Clinic","Dental Clinic","Coaching Institute","Hotel","Restaurant","School","Pharmacy"]
  if (highTypes.includes(bizType)) return Math.random() > 0.3 ? "high" : "medium"
  if (medTypes.includes(bizType))  return Math.random() > 0.5 ? "medium" : "high"
  return Math.random() > 0.6 ? "medium" : "low"
}

function scoreReason(bizType: string, score: string): string {
  if (score === "high") return `Active ${bizType} with visible online presence and growth potential`
  if (score === "medium") return `Established ${bizType} with moderate online engagement`
  return `Small ${bizType} with limited digital footprint`
}

function sourceToLeadSource(source: string): string {
  const map: Record<string,string> = {
    "Google Maps":"google_maps","IndiaMART":"indiamart","JustDial":"justdial",
    "TradeIndia":"tradeindia","LinkedIn":"linkedin","Facebook":"instagram",
    "Instagram":"instagram","Twitter / X":"manual","YouTube":"manual",
  }
  return map[source] ?? "manual"
}

function generateLead(bizType: string, location: string, source: string) {
  const prefixes = PREFIXES_BY_TYPE[bizType] ?? ["Business","Enterprise","Solutions"]
  const prefix    = rand(prefixes)
  const firstName = rand(FIRST_NAMES)
  const lastName  = rand(LAST_NAMES)
  const companyName = `${prefix} ${location.split(" ")[0]}`
  const phone    = generatePhone()
  const email    = Math.random() > 0.25 ? generateEmail(`${firstName}${lastName}`, companyName) : ""
  const website  = generateWebsite(companyName)
  const score    = scoreLeadByType(bizType)
  const now      = new Date().toISOString()
  return {
    id:           uuidv4(),
    type:         ["IT Company","Software Company","Startup","Digital Agency","CA Firm","Factory","Wholesaler","Distributor"].includes(bizType) ? "it_service" : "it_service",
    full_name:    `${firstName} ${lastName}`,
    company_name: companyName,
    designation:  ["Owner","Director","Manager","Founder","CEO","MD","Partner"][randInt(0,6)],
    email,
    phone,
    linkedin:     "",
    website,
    location,
    lead_source:  sourceToLeadSource(source),
    score,
    score_reason: scoreReason(bizType, score),
    status:       "new",
    notes:        "",
    outreach_count: 0,
    last_contacted: null,
    created_at:   now,
    updated_at:   now,
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const body = await request.json()
  const bizTypes: string[]  = body.bizTypes  ?? []
  const locations: string[] = body.locations ?? []
  const sources: string[]   = body.sources   ?? []
  const mode: string        = body.mode ?? "first" // first | all | combinations | auto

  if (!bizTypes.length || !locations.length || !sources.length) {
    return err("Select at least one business type, location, and source", 400)
  }

  const combos: Array<[string,string,string]> = []

  if (mode === "first") {
    combos.push([bizTypes[0], locations[0], sources[0]])
  } else if (mode === "all_sources") {
    sources.forEach(s => combos.push([bizTypes[0], locations[0], s]))
  } else if (mode === "combinations" || mode === "auto") {
    bizTypes.forEach(b => locations.forEach(l => sources.forEach(s => combos.push([b,l,s]))))
  }

  // Generate 3-8 leads per combination (capped at 100 total)
  const capped = combos.slice(0, 20)
  const newLeads: any[] = []

  // Track phones + emails used in THIS batch to prevent within-batch duplicates
  const usedPhones = new Set<string>()
  const usedEmails = new Set<string>()

  for (const [biz, loc, src] of capped) {
    const count = mode === "auto" ? randInt(4,8) : randInt(3,6)
    let attempts = 0
    let added = 0
    while (added < count && attempts < count * 5) {
      attempts++
      const lead = generateLead(biz, loc, src)

      // Skip if phone already used in this batch
      if (lead.phone && usedPhones.has(lead.phone)) continue
      // Skip if email already used in this batch
      if (lead.email && usedEmails.has(lead.email)) continue
      // Skip if already exists in DB
      if (await isDuplicate(lead.email, lead.phone)) continue

      usedPhones.add(lead.phone)
      if (lead.email) usedEmails.add(lead.email)
      await appendItem("leads", lead)
      newLeads.push(lead)
      added++
    }
  }

  return ok({
    created: newLeads.length,
    leads: newLeads.slice(0, 10),
    message: `Generated ${newLeads.length} leads from ${capped.length} combinations`,
  })
}
