namespace Vcf.Contracts.VCF

open System
open System.Threading.Tasks
open System.Collections.Generic
open System.Numerics
open Nethereum.Hex.HexTypes
open Nethereum.ABI.FunctionEncoding.Attributes
open Nethereum.Web3
open Nethereum.RPC.Eth.DTOs
open Nethereum.Contracts.CQS
open Nethereum.Contracts.ContractHandlers
open Nethereum.Contracts
open System.Threading
open Vcf.Contracts.VCF.ContractDefinition


    type VCFService (web3: Web3, contractAddress: string) =
    
        member val Web3 = web3 with get
        member val ContractHandler = web3.Eth.GetContractHandler(contractAddress) with get
    
        static member DeployContractAndWaitForReceiptAsync(web3: Web3, vCFDeployment: VCFDeployment, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> = 
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            web3.Eth.GetContractDeploymentHandler<VCFDeployment>().SendRequestAndWaitForReceiptAsync(vCFDeployment, cancellationTokenSourceVal)
        
        static member DeployContractAsync(web3: Web3, vCFDeployment: VCFDeployment): Task<string> =
            web3.Eth.GetContractDeploymentHandler<VCFDeployment>().SendRequestAsync(vCFDeployment)
        
        static member DeployContractAndGetServiceAsync(web3: Web3, vCFDeployment: VCFDeployment, ?cancellationTokenSource : CancellationTokenSource) = async {
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            let! receipt = VCFService.DeployContractAndWaitForReceiptAsync(web3, vCFDeployment, cancellationTokenSourceVal) |> Async.AwaitTask
            return new VCFService(web3, receipt.ContractAddress);
            }
    
        member this.ApproveKYCRequestAsync(approveKYCFunction: ApproveKYCFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(approveKYCFunction);
        
        member this.ApproveKYCRequestAndWaitForReceiptAsync(approveKYCFunction: ApproveKYCFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(approveKYCFunction, cancellationTokenSourceVal);
        
        member this.CapitalFundQueryAsync(capitalFundFunction: CapitalFundFunction, ?blockParameter: BlockParameter): Task<CapitalFundOutputDTO> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryDeserializingToObjectAsync<CapitalFundFunction, CapitalFundOutputDTO>(capitalFundFunction, blockParameterVal)
            
        member this.CreateCapitalRequestAsync(createCapitalFunction: CreateCapitalFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(createCapitalFunction);
        
        member this.CreateCapitalRequestAndWaitForReceiptAsync(createCapitalFunction: CreateCapitalFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(createCapitalFunction, cancellationTokenSourceVal);
        
        member this.InvestInCapitalRequestAsync(investInCapitalFunction: InvestInCapitalFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(investInCapitalFunction);
        
        member this.InvestInCapitalRequestAndWaitForReceiptAsync(investInCapitalFunction: InvestInCapitalFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(investInCapitalFunction, cancellationTokenSourceVal);
        
        member this.OwnerQueryAsync(ownerFunction: OwnerFunction, ?blockParameter: BlockParameter): Task<string> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<OwnerFunction, string>(ownerFunction, blockParameterVal)
            
        member this.RevertKYCRequestAsync(revertKYCFunction: RevertKYCFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(revertKYCFunction);
        
        member this.RevertKYCRequestAndWaitForReceiptAsync(revertKYCFunction: RevertKYCFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(revertKYCFunction, cancellationTokenSourceVal);
        
        member this.TransferOwnershipRequestAsync(transferOwnershipFunction: TransferOwnershipFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(transferOwnershipFunction);
        
        member this.TransferOwnershipRequestAndWaitForReceiptAsync(transferOwnershipFunction: TransferOwnershipFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(transferOwnershipFunction, cancellationTokenSourceVal);
        
        member this.UsersQueryAsync(usersFunction: UsersFunction, ?blockParameter: BlockParameter): Task<UsersOutputDTO> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryDeserializingToObjectAsync<UsersFunction, UsersOutputDTO>(usersFunction, blockParameterVal)
            
    

