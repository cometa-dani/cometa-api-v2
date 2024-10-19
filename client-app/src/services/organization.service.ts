import axios from 'axios';
import { Organization, OrganizationItem } from '../models/Organization.model';


class OrganizationService {

  private http = axios.create({
    baseURL: '/api/v1',
  });

  public getOrganizationById(id: string) {
    return this.http.get<OrganizationItem>(`/organizations/${id}`);
  }

  public getOrganizations() {
    return this.http.get<Organization[]>('/organizations');
  }

  public createOrganization(organization: Partial<Organization>, logo?: File) {
    const formData = new FormData();
    if (logo) {
      formData.append('logo', logo);
    }
    formData.append('organization', JSON.stringify({ ...organization }));

    return this.http.post<Organization>('/organizations', formData);
  }

  public createLocation(organizationId: string, location: Partial<OrganizationItem>) {
    return this.http.post<OrganizationItem>(`/organizations/${organizationId}/locations`, location);
  }
}

export default new OrganizationService();
