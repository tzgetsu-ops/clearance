export interface Token {
  access_token: string
  token_type: string
}

export interface UserRead {
  id: number
  username: string
  email: string
  full_name: string
  role: Role
  department?: Department | null
  clearance_department?: ClearanceDepartment | null
}

export interface UserCreate {
  username: string
  password: string
  email: string
  full_name: string
  role: Role
  department?: Department | null
  clearance_department?: ClearanceDepartment | null
}

export interface UserUpdate {
  username?: string | null
  email?: string | null
  full_name?: string | null
  role?: Role | null
  department?: Department | null
  clearance_department?: ClearanceDepartment | null
  password?: string | null
}

export interface StudentRead {
  id: number
  full_name: string
  matric_no: string
  department: Department
}

export interface StudentReadWithClearance {
  id: number
  full_name: string
  matric_no: string
  department: Department
  clearance_statuses: ClearanceStatusRead[]
  rfid_tag?: RFIDTagRead | null
}

export interface StudentCreate {
  full_name: string
  matric_no: string
  email: string
  department: Department
  password: string
}

export interface StudentUpdate {
  full_name?: string | null
  department?: Department | null
  email?: string | null
}

export interface StudentLookupRequest {
  matric_no: string
}

export interface ClearanceStatusRead {
  department: ClearanceDepartment
  status: ClearanceStatusEnum
  remarks?: string | null
}

export interface ClearanceUpdate {
  matric_no: string
  department: ClearanceDepartment
  status: ClearanceStatusEnum
  remarks?: string | null
}

export interface RFIDTagRead {
  tag_id: string
  student_id?: number | null
  user_id?: number | null
}

export interface TagLink {
  tag_id: string
  matric_no?: string | null
  username?: string | null
}

export interface TagScan {
  tag_id: string
}

export interface ActivationRequest {
  device_id: number
}

export interface DeviceRead {
  id: number
  device_name: string
  api_key: string
  location: string
  department: Department
  is_active: boolean
}

export interface DeviceCreate {
  device_name: string
  location: string
  department: Department
}

export interface HTTPValidationError {
  detail: ValidationError[]
}

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export enum Role {
  ADMIN = "admin",
  STAFF = "staff",
  STUDENT = "student",
}

export enum Department {
  COMPUTER_SCIENCE = "Computer Science",
  ENGINEERING = "Engineering",
  BUSINESS_ADMINISTRATION = "Business Administration",
  LAW = "Law",
  MEDICINE = "Medicine",
}

export enum ClearanceDepartment {
  LIBRARY = "Library",
  STUDENT_AFFAIRS = "Student Affairs",
  BURSARY = "Bursary",
  ACADEMIC_AFFAIRS = "Academic Affairs",
  HEALTH_CENTER = "Health Center",
}

export enum ClearanceStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface LoginRequest {
  username: string
  password: string
}

export interface StudentLookupBody {
  request: StudentLookupRequest
  required_roles?: Role[] | null
}
