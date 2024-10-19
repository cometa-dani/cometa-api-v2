import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "./queryKeys";
import organizationService from "../services/organization.service";
import { Organization, OrganizationItem } from "../models/Organization.model";


export const useQueryGetAllOrganizations = () => {
  return useQuery({
    queryKey: [QueryKeys.GET_ALL_ORGANIZATIONS],
    queryFn: async (): Promise<Organization[]> => {
      const res = await organizationService.getOrganizations();

      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      else {
        return res.data;
      }
    },
  });
};


export const useQueryGetOrganizationById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.GET_ORGANIZATION_BY_ID, id],
    queryFn: async (): Promise<OrganizationItem> => {
      const res = await organizationService.getOrganizationById(id);

      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      else {
        return res.data;
      }
    },
  });
};


export const useMutationCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { organization: Partial<Organization>, imgFile?: File }) => {
      const res = await organizationService.createOrganization(payload.organization, payload.imgFile);
      if (res.status !== 201) {
        throw new Error(res.statusText);
      }
      else {
        return res.data;
      }
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.GET_ALL_ORGANIZATIONS] });

      // optimistic update
      queryClient.setQueryData<Organization[]>([QueryKeys.GET_ALL_ORGANIZATIONS], (oldData) => {
        if (oldData?.length) {
          const newOrganization = {
            ...payload.organization,
            mediaUrl: "https://via.placeholder.com/150",
            id: oldData[oldData.length - 1]?.id + 1,

          } as Organization;
          return [...oldData, newOrganization];
        }
        else {
          const newOrganization = {
            ...payload.organization,
            mediaUrl: "https://via.placeholder.com/150",
            id: 1,
          } as Organization;
          return [newOrganization];
        }
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_ALL_ORGANIZATIONS] });
    },
  });
};


export const useMutationCreateLocation = () => {
  return (
    useMutation({
      mutationFn: async (payload: { organizationId: string, location: Partial<OrganizationItem> }) => {
        const res = await organizationService.createLocation(payload.organizationId, payload.location);
        if (res.status !== 201) {
          throw new Error(res.statusText);
        }
        else {
          return res.data;
        }
      },
    })
  );
};
