from huggingface_hub import HfApi
api = HfApi()
# api.upload_folder(
#     folder_path="./index",
#     path_in_repo='/index',
#     repo_id="KonghaYao/civitai",
#     repo_type="dataset",
#     create_pr=1
# )
api.upload_folder(
    folder_path="./data",
    path_in_repo='/data',
    repo_id="KonghaYao/civitai",
    repo_type="dataset",
    create_pr=1
)
