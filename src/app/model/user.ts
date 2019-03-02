export class User{
    uid: string;
    email: string;
    role?: string;

    isInstructor():boolean {
        return this.role == "instructor";
    }
}