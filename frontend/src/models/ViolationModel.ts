export interface ViolationModel {
    id: string,
    applicationNumber: string,
    publicationDate: string,
    district: string | null,
    region: string | null,
    object: string,
    objectCategory: string,
    problemTopic: string,
    responseDeadline: string | null,
    responseStatus: string,
}

export interface UserModel {
    id: string,
    firstName: string,
    middleName: string,
    lastName: string
}