export interface ViolationDTO {
    id: string,
    applicationNumber: string,
    publicationDate: number,
    district: string | null,
    region: string | null,
    object: string,
    objectCategory: string,
    problemTopic: string,
    responseDeadline: string | null,
    responseStatus: string,
}