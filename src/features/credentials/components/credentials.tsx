"use client"
import {  useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials"
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Credential } from "@prisma/client";
// import  { CredentialType } from "@prisma/client"; // --
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

// to avoid node build error 

const CredentialType = {
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
  GEMINI: 'GEMINI',
  TELEGRAM: 'TELEGRAM',
} as const;

//-------------------
export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();
    const {searchValue, onSearchChange}=useEntitySearch({
        params,
        setParams,
    });
    
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Credentials"
        />
    )
}

export const CredentialsList = () => {
    
    const credentials = useSuspenseCredentials();

    return (
        <EntityList
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty/>}
        />
    );

};

export const CredentialsHeader = ({ disabled }: {disabled?: boolean}) => {

   
    const router = useRouter();
    const handleCreate = () => {

        router.push(`/credentials/new`);

    }

    return (
            <EntityHeader 
              title="Credentials"
              description="Create and manage your credentials"
              newButtonHref="/credentials/new"
              newButtonLabel="New credential"
              disabled={disabled}
            />
    );
};

export const CredentialsPagination = () => {
    const credentials= useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();

    return (
        <EntityPagination
            disabled={credentials.isFetching}
            totalPages={credentials.data.totalPages}
            page={credentials.data.page}
            onPageChange={(page) => setParams({...params, page})}
        />
    )
}

export const CredentialsContainer = ({
    children
}:{
    children: React.ReactNode
}) => {
    return (
        <EntityContainer

            header={<CredentialsHeader/>}
            search={<CredentialsSearch/>}
            pagination={<CredentialsPagination/>}
        >
            {children}
        </EntityContainer>

    );
};

export const CredentialsLoading = () => {
    return <LoadingView message="Loading Credentials..."/>
};

export const CredentialsError = () => {
    return <ErrorView message="Error Loading Credentials"/>;
};

export const CredentialsEmpty = () => {

    const router = useRouter();
    const handleCreate = () => {
        router.push(`/credentials/new`);
    };

    return (
            <EmptyView
                onNew={handleCreate}
                message="You haven't created any credentials yet. get started by creating your first credential"
            />
    );
};

// const credentialLogos: Record<CredentialType, string> = { // to avoid nod ebuild error
const credentialLogos: Record<Credential['type'], string> = {
    [CredentialType.OPENAI] : "/logos/openai.svg",
    [CredentialType.ANTHROPIC] : "/logos/anthropic.svg",
    [CredentialType.GEMINI] : "/logos/gemini.svg",
    [CredentialType.TELEGRAM] : "/logos/telegram.svg",
};

export const CredentialItem = ({
    data,
}: {
    data: Credential
}) => {
    const removeCredential = useRemoveCredential();
    const handleRemove = () => {
        removeCredential.mutate({ id: data.id });
    };

    const logo = credentialLogos[data.type] || "/logos/openai.svg";

    return (
        <EntityItem 
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                Updated {formatDistanceToNow(data.updatedAt, { addSuffix:true})}{" "}
                &bull; Created{" "}
                {formatDistanceToNow(data.createdAt, { addSuffix:true})}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <Image src={logo} alt={data.type} width={20} height={20} />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}